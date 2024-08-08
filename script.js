document.addEventListener('DOMContentLoaded', function() {
    loadWorkouts();
});

document.getElementById('loginBtn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple check for demonstration purposes
    if (username && password) {
        // Hide login container
        document.querySelector('.login-container').classList.add('hidden');
        
        // Show workout container and shared workouts
        document.querySelector('.workout-container').classList.remove('hidden');
        document.querySelector('.shared-workouts').classList.remove('hidden');

        // Store username for session
        sessionStorage.setItem('username', username);
    } else {
        alert('Please enter both username and password');
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    // Show login container
    document.querySelector('.login-container').classList.remove('hidden');

    // Hide workout container and shared workouts
    document.querySelector('.workout-container').classList.add('hidden');
    document.querySelector('.shared-workouts').classList.add('hidden');

    // Clear session storage
    sessionStorage.removeItem('username');
});

document.getElementById('shareWorkoutBtn').addEventListener('click', function() {
    const workoutDetails = document.getElementById('workoutDetails').value;
    const workoutDate = document.getElementById('workoutDate').value;
    const workoutTime = document.getElementById('workoutTime').value;
    const username = sessionStorage.getItem('username');

    if (workoutDetails && workoutDate && workoutTime) {
        const workout = {
            details: workoutDetails,
            date: workoutDate,
            time: workoutTime,
            username: username,
            joinedUsers: []
        };

        saveWorkout(workout);
        displayWorkout(workout);

        // Clear input fields after sharing
        document.getElementById('workoutDetails').value = '';
        document.getElementById('workoutDate').value = '';
        document.getElementById('workoutTime').value = '';
    } else {
        alert('Please enter workout details, date, and time');
    }
});

document.getElementById('clearLocalStorageBtn').addEventListener('click', function() {
    clearUserData();
});

function saveWorkout(workout) {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts.push(workout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

function loadWorkouts() {
    document.getElementById('sharedWorkouts').innerHTML = '<h1>Community Workouts</h1>'; // Clear existing workouts
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts.forEach(workout => displayWorkout(workout));
}

function displayWorkout(workout) {
    const workoutContainer = document.createElement('div');
    workoutContainer.classList.add('workout');

    const workoutInfo = document.createElement('p');
    workoutInfo.textContent = `Details: ${workout.details} | Date: ${workout.date} | Time: ${workout.time}`;
    workoutContainer.appendChild(workoutInfo);

    const userItem = document.createElement('p');
    userItem.textContent = `Shared by: ${workout.username}`;
    workoutContainer.appendChild(userItem);

    if (workout.username === sessionStorage.getItem('username')) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete workout';
        deleteButton.addEventListener('click', function() {
            deleteWorkout(workout);
            workoutContainer.remove();
        });
        workoutContainer.appendChild(deleteButton);
    }

    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join workout';
    joinButton.addEventListener('click', function() {
        joinWorkout(workout, workoutContainer);
    });
    workoutContainer.appendChild(joinButton);

    const joinedUsersList = document.createElement('div');
    joinedUsersList.classList.add('joined-users');
    workout.joinedUsers.forEach(user => {
        const userItem = document.createElement('p');
        userItem.textContent = user;

        if (user === sessionStorage.getItem('username')) {
            const leaveButton = document.createElement('button');
            leaveButton.textContent = 'Leave workout';
            leaveButton.addEventListener('click', function() {
                leaveWorkout(workout, userItem);
            });
            userItem.appendChild(leaveButton);
        }

        joinedUsersList.appendChild(userItem);
    });
    workoutContainer.appendChild(joinedUsersList);

    document.getElementById('sharedWorkouts').appendChild(workoutContainer);
}

function deleteWorkout(workout) {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts = workouts.filter(w => w.details !== workout.details || w.date !== workout.date || w.time !== workout.time || w.username !== workout.username);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    loadWorkouts(); // Refresh the list of workouts
}

function joinWorkout(workout, workoutContainer) {
    const currentUsername = sessionStorage.getItem('username');
    if (!workout.joinedUsers.includes(currentUsername)) {
        workout.joinedUsers.push(currentUsername);
        updateWorkoutsStorage();

        const userItem = document.createElement('p');
        userItem.textContent = currentUsername;

        const leaveButton = document.createElement('button');
        leaveButton.textContent = 'Leave workout';
        leaveButton.addEventListener('click', function() {
            leaveWorkout(workout, userItem);
        });
        userItem.appendChild(leaveButton);

        workoutContainer.querySelector('.joined-users').appendChild(userItem);
    }
}

function leaveWorkout(workout, userItem) {
    const currentUsername = sessionStorage.getItem('username');
    workout.joinedUsers = workout.joinedUsers.filter(user => user !== currentUsername);
    userItem.remove();

    if (workout.joinedUsers.length === 0 && workout.username === "") {
        deleteWorkout(workout);
    } else {
        updateWorkoutsStorage();
        loadWorkouts(); // Refresh the list of workouts
    }
}

function clearUserData() {
    const currentUsername = sessionStorage.getItem('username');
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts = workouts.map(workout => {
        workout.joinedUsers = workout.joinedUsers.filter(user => user !== currentUsername);
        if (workout.username === currentUsername) {
            workout.username = "";
        }
        return workout;
    }).filter(workout => workout.joinedUsers.length > 0 || workout.username !== "");

    localStorage.setItem('workouts', JSON.stringify(workouts));
    loadWorkouts(); // Refresh the list of workouts
}

function updateWorkoutsStorage() {
    let workoutContainers = document.querySelectorAll('.shared-workouts .workout');
    let workouts = [];
    workoutContainers.forEach(workoutContainer => {
        let workout = {
            details: workoutContainer.querySelector('p').textContent.split('|')[0].replace('Details: ', '').trim(),
            date: workoutContainer.querySelector('p').textContent.split('|')[1].replace('Date: ', '').trim(),
            time: workoutContainer.querySelector('p').textContent.split('|')[2].replace('Time: ', '').trim(),
            username: workoutContainer.querySelector('p:nth-child(2)').textContent.replace('Shared by: ', '').trim(),
            joinedUsers: Array.from(workoutContainer.querySelectorAll('.joined-users p')).map(userItem => userItem.textContent.replace('Leave workout', '').trim())
        };
        workouts.push(workout);
    });
    localStorage.setItem('workouts', JSON.stringify(workouts));
}
