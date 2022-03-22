const socket = io();

socket.on('message', function(message){
    messageOutput(message);

    //scroll down to newest message
    const messageContainer = document.querySelector(".chat-messages");
    messageContainer.scrollTop = messageContainer.scrollHeight;
});


//submit message

const chatForm = document.getElementById('chat-form');

chatForm.addEventListener('submit', (evt)=> {
    evt.preventDefault();
    let msg = evt.target.elements.msg.value;
    //emit the user message to server
    socket.emit('chatMessage', msg);

    // clear input
    evt.target.elements.msg.value = "";
    evt.target.elements.msg.focus();
});

//add messages to dom

function messageOutput (message) {
    console.log(message);
    // let currentUser = document.getElementById('currentUser').innerHTML
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML= `<p class='meta'>${message.userName} <span>${message.time}</span></p>
    <p class= "msg-body">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
};
