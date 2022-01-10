const dispatchButton = document.getElementById("btn-dispatch");
const addRiderButton = document.getElementById("button-add-rider");
const riderNameInput = document.getElementsByName("name");
const riderStartingFloorInput = document.getElementsByName("startingFloor");
const riderDropoffFloorInput = document.getElementsByName("dropoffFloor");
const ridersList = document.getElementById("ol-riders");
const requestsList = document.getElementById("ul-requests");
const elevatorRender = document.getElementById("elevator-container");
const elevatorRail = document.getElementsByClassName("elevator-rail")
const floorDisplay = document.getElementById("floor-display");
const actionIndicator = document.getElementById("current-action");
const elevator = new Elevator();

let sequence = [];
elevator.requests = [
  new Person("Bill", 3, 0),
  new Person("Kay", 2, 5),
  new Person("Jack", 3, 0),
];

listRequests();

// EVENT LISTENERS

addRiderButton.addEventListener("click", () => {
  elevator.requests.push(
    new Person(
      riderNameInput[0].value,
      +riderStartingFloorInput[0].value,
      +riderDropoffFloorInput[0].value
    )
  );
  listRequests();
});

dispatchButton.addEventListener("click", () => {
  //elevator.requests = riders;
  actionIndicator.textContent = "";
  listRequests();

  elevator.dispatch();
});

elevator.on("floorChanged", () => {
  sequence.push({ event: "floorChanged", floor: elevator.currentFloor });
});

elevator.on("riderEntered", (pickups) => {
  pickups.length && sequence.push({ event: "riderEntered", pickups: pickups });
});

elevator.on("riderExit", (dropOffs) => {
  dropOffs.length && sequence.push({ event: "riderExit", dropOffs: dropOffs });
});

elevator.on("done", () => {
  playAnimation();
});

//FUNCTIONS
function playAnimation() {
  let i = 0;

  const interval = setInterval(() => {
    if (i > sequence.length - 1) {
      clearInterval(interval);
      sequence = [];
    }
    switch (sequence[i].event) {
      case "floorChanged":
        moveElevator(sequence[i].floor);
        i++;
        return;
      case "riderEntered":
        listRiders(sequence[i].pickups);
        i++;
        return;
      case "riderExit":
        removeRiders(sequence[i].dropOffs[0].dropOffFloor);
        i++;
        return;
      default:
        return;
    }
  }, 1000);
}

function getHighestFloor() {
  const highestDropoff = Math.max.apply(Math, elevator.requests.map((r)=> r.dropOffFloor))
  const highestStarting = Math.max.apply(Math, elevator.requests.map((r)=> r.currentFloor))
  const highestFloor = highestDropoff > highestStarting ? highestDropoff : highestStarting

  elevatorRail[0].style.height = `calc(210px * ${highestFloor + 1})`
}

function listRequests() {
  requestsList.replaceChildren([])
  elevator.requests.forEach((request) => {
    const li = document.createElement("li");
    li.appendChild(
      document.createTextNode(
        `${request.name} , puckup @ floor: ${request.currentFloor} Drop-off floor:  ${request.dropOffFloor}`
      )
    );
    li.classList.add("pickupFloor-" + request.currentFloor);
    requestsList.append(li);
  });
  
  getHighestFloor()
}

function moveElevator(to) {
  elevatorRender.animate(
    [
      {
        transform: `translateY(${to * 100}%)`,
      },
    ],
    {
      duration: 1000,
    }
  ).onfinish = (e) => {
    floorDisplay.firstChild.replaceWith(to);
    elevatorRender.style.transform = `translateY(${to * 100}%)`;
  };
  return true;
}

function listRiders(riders) {
  const pickupPassengers = document.querySelectorAll(
    ".pickupFloor-" + riders[0].currentFloor
  );
  pickupPassengers.forEach((passenger) => {
    passenger.parentNode.removeChild(passenger);
  });

  let action = "Picked up ";

  riders.forEach((rider) => {
    const li = document.createElement("li");
    action += rider.name + ", ";
    li.appendChild(
      document.createTextNode(
        rider.name + ", Drop-off floor: " + rider.dropOffFloor
      )
    );
    li.classList.add("dropOffFloor-" + rider.dropOffFloor);
    ridersList.append(li);
  });

  actionIndicator.textContent = action;
}

function removeRiders(dropOffFloor) {
  let action = "Dropped off ";
  const dropOffPassengers = document.querySelectorAll(
    ".dropOffFloor-" + dropOffFloor
  );
  dropOffPassengers.forEach((passenger) => {
    const passengerName = passenger.innerHTML.substr(
      0,
      passenger.innerHTML.indexOf(",")
    );
    action += passengerName + ", ";
    passenger.parentNode.removeChild(passenger);
  });

  actionIndicator.textContent = action;
}
