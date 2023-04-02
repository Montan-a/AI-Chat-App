import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(el) {
  el.textContent = "";

  loadInterval = setInterval(() => {
    el.textContent += ".";

    if (Element.textContent === "...") {
      el.textContent = "";
    }
  }, 300);
}

function typeText(el, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNum = Math.random();
  const hexadecimalString = randomNum.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`;
}

function chatStripe(isAI, value, uniqueId) {
  return `
  <div class="wrapper ${isAI && "ai"}">
    <div class="chat">
      <div class="profile">
        <img src="${isAI ? bot : user}"
        alt="${isAI ? bot : user}"/>
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
    </div>
  </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //bot's chatStripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  //Fetch data from server-> bot's response

  const response = await fetch("https://code-chat.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
