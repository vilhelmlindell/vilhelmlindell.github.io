let style = document.createElement('style');
style.innerHTML = `
body {
    font-family: Arial, sans-serif;
}
h2 {
    color: #333;
    margin-bottom: 10px;
}
p {
    margin: 5px 0;
    padding: 10px;
    border-radius: 5px;
}
.free {
    background-color: #c8e6c9;
}
.occupied {
    background-color: #ffcdd2;
}
`;
document.head.appendChild(style);

function timeDifference(time1, time2) {
    let t1 = new Date(2023, 0, 1, ...time1.split(':').map(Number));
    let t2 = new Date(2023, 0, 1, ...time2.split(':').map(Number));
    return new Date(t2 - t1).toISOString().substr(11, 8);
}

function getCurrentTime() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    // Pad with '0' if needed
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds;
}

async function getFreeRooms() {
    let response = await fetch('lesson_times.json');
    let lessonTimes = await response.json();

    //let current_time = getCurrentTime();
    let current_time = "14:15:00";
    let free_rooms = [];
    let occupied_rooms = [];

    for (let room_lesson_times of lessonTimes) {
        let room = room_lesson_times[0];

        for (let i = 0; i < room_lesson_times[1].length; i++) {
            let lesson_time = room_lesson_times[1][i];

            if (current_time <= lesson_time[0]) {
                let free_duration = timeDifference(current_time, lesson_time[0]);
                free_rooms.push([room, free_duration]);
                break;
            } else if (current_time >= lesson_time[1]) {
                if (i === room_lesson_times[1].length - 1) {
                    let free_duration = "Resten av dagen";
                    free_rooms.push([room, free_duration]);
                    break;
                }
                continue;
            } else if (current_time >= lesson_time[0]) {
                let free_duration;
                if (i < room_lesson_times[1].length - 1) {
                    let next_lesson_time = room_lesson_times[1][i + 1];
                    free_duration = timeDifference(lesson_time[1], next_lesson_time[0]);
                } else {
                    free_duration = "Resten av dagen";
                }

                if (current_time <= lesson_time[1]) {
                    let occupied_duration = timeDifference(current_time, lesson_time[1]);
                    occupied_rooms.push([room, occupied_duration, free_duration]);
                    break;
                }
            }
        }

    }
        free_rooms.sort((a, b) => b[1].localeCompare(a[1]));
        occupied_rooms.sort((a, b) => a[1].localeCompare(b[1]) || b[2].localeCompare(a[2]));

        let freeRoomsElement = document.createElement('table');
        freeRoomsElement.innerHTML = '<tr><th>Lediga Rum</th><th>Tid Ledigt</th></tr>' + free_rooms.map(room => `<tr class="free"><td>${room[0]}</td><td>${room[1]}</td></tr>`).join('');
        document.body.appendChild(freeRoomsElement);

        let occupiedRoomsElement = document.createElement('table');
        occupiedRoomsElement.innerHTML = '<tr><th>Upptagna Rum</th><th>Ledigt Om</th><th>Tid Ledigt</th></tr>' + occupied_rooms.map(room => `<tr class="occupied"><td>${room[0]}</td><td>${room[1]}</td><td>${room[2]}</td></tr>`).join('');
        document.body.appendChild(occupiedRoomsElement);

}

getFreeRooms();
