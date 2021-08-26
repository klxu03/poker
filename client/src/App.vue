<template>
  <PlayerAmount :amount="5000" />
  <Cards :cards="['', '']" />
  <hr />
  <Pot :amount="0" :cards="['10', 'J', 'Q', '9']" />
  <hr />
  <Cards :cards="['Q', 'J']" />
  <Raise :min="500" :max="6000" />

  <PlayerAmount :amount="10000" />
</template>

<script>
import { defineComponent } from 'vue';

import Raise from './components/Raise.vue';
import PlayerAmount from './components/PlayerAmount.vue';
import Cards from './components/Cards.vue';
import Pot from './components/Pot.vue';

export default defineComponent({
  components: {
    Raise,
    PlayerAmount,
    Cards,
    Pot,
  },
});

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
