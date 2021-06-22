<template>
  <div id="app">
    <div class="columns is-mobile">
      <div class="column is-half is-offset-one-quarter">
        <div class="card" style="w">
          <header class="card-header">
            <section class="hero is-primary card-header-title">
              <div class="hero-body">
                <p class="title">
                  Chernobog
                </p>
                <p class="subtitle">
                  Made by Nick & Noah
                </p>
              </div>
            </section>
          </header>
          <div class="card-content">
            <div v-if="user == null" class="content">
              <div class="field has-addons">
                <p class="control">
                  <input
                    v-model="joinname"
                    class="input"
                    type="text"
                    placeholder="Name"
                  />
                </p>
                <p class="control">
                  <input
                    v-model="roomid"
                    class="input"
                    type="text"
                    placeholder="Code"
                  />
                </p>
                <p class="control">
                  <button v-on:click="join" class="button">
                    Join
                  </button>
                </p>
              </div>
              <p class="title">Or</p>
              <div class="field has-addons">
                <p class="control">
                  <input
                    v-model="createname"
                    class="input"
                    type="text"
                    placeholder="Name"
                  />
                </p>
                <p class="control">
                  <button v-on:click="create" class="button">
                    Create
                  </button>
                </p>
              </div>
            </div>
            <div v-if="user && !started" class="content">
              <h1>Lobby</h1>
              <p>Room: {{ user.room }}</p>
              <h2>Players:</h2>
              <ul>
                <li v-for="user in users" v-bind:key="user.id">
                  {{ user.username }}
                </li>
              </ul>
              <b-button v-if="user.isAdmin" v-on:click="start" type="is-primary"
                >Start</b-button
              >
            </div>
            <div v-if="started" class="content">
              <h2>Players:</h2>
              <ul>
                <li v-for="user in users" v-bind:key="user.id">
                  {{ user.username }}
                </li>
              </ul>
              <h3 v-if="showWord">Word: {{ word }}</h3>
              <Whiteboard />
              <div v-if="choosing">
                <b-button
                  class="word"
                  v-for="word in words"
                  v-on:click="choose(word)"
                  type="is-primary"
                  >{{ word }}</b-button
                >
              </div>
              <div class="content border">
                <div id="chat" class="chat-messages">
                  <p v-for="msg in messages">
                    {{ msg.user.username }}: {{ msg.message }}
                  </p>
                  <div id="top"></div>
                </div>
                <div class="field has-addons">
                  <p class="control" style="width:100%">
                    <input
                      v-model="message"
                      class="input"
                      type="text"
                      placeholder="Message"
                    />
                  </p>
                  <p class="control">
                    <button v-on:click="send" class="button">
                      Senden
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Whiteboard from "./components/whiteboard.vue";
export default {
  name: "App",
  data() {
    return {
      createname: "",
      joinname: "",
      roomid: "",
      user: null,
      users: [],
      started: false,
      message: "",
      messages: [],
      choosing: false,
      words: [],
      word: "",
      showWord: false,
    };
  },
  components: {
    Whiteboard,
  },
  methods: {
    create() {
      var name = this.createname;
      this.$socket.client.emit("join", { name, undefined });
    },
    join() {
      var name = this.joinname;
      var room = this.roomid;
      this.$socket.client.emit("join", { name, room });
    },
    start() {
      var user = this.user;
      this.$socket.client.emit("start", { user });
    },
    send() {
      var message = this.message;
      this.$socket.client.emit("send", message);
      this.message = "";
    },
    choose(word) {
      this.word = word;
      this.showWord = true;
      this.$socket.client.emit("choosed", word);
      this.choosing = false;
    },
  },
  mounted() {},
  updated() {
    var objDiv = document.getElementById("chat");
    objDiv.scrollTop = objDiv.scrollHeight;
  },
  sockets: {
    connect() {
      console.log("Connected to the socket server.");
    },
    joined(user) {
      this.user = user;
    },
    userJoined(user) {
      this.users.add(user);
    },
    roomUsers(users) {
      this.users = users;
    },
    started(state) {
      this.started = state;
    },
    message(msg) {
      this.messages.push(msg);
    },
    choose(words) {
      this.choosing = true;
      this.words = words;
    },
    guessed() {
      this.showWord = false;
    },
  },
};
</script>

<style>
.card {
  margin-top: 10%;
}

.chat-messages {
  padding-top: 20px;
  height: 100px;
  overflow-y: auto;
}

.border {
  border-top: solid lightgrey;
}
.word {
  margin: 10px;
}
</style>
