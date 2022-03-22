const socket = io();

socket.on('message', function(message){
    messageOutput(message);

    //scroll down to newest message
    const messageContainer = document.querySelector(".chat-messages");
    messageContainer.scrollTop = messageContainer.scrollHeight;
});


//submit user message

const chatForm = document.getElementById('chat-form');

chatForm.addEventListener('submit', (evt)=> {
    evt.preventDefault();
    let msg = evt.target.elements.msg.value;
    let sender = document.getElementById('currentUser').innerHTML
    //emit the user message and sender to server
    socket.emit('chatMessage', {sender, msg});

    // clear input
    evt.target.elements.msg.value = "";
    evt.target.elements.msg.focus();
});

//add messages to dom

function messageOutput (message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML= `<p class='meta'>${message.userName} <span>${message.time}</span></p>
    <p class= "msg-body">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
};
