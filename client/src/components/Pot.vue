<template>
  <div>
    <div class="pot-amount">
      <h1>Pot Amount: {{ amount }}</h1>
    </div>
    <div class="card-container">
      <Card v-for="card in cards" :card="card" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

import Card from './Card.vue';

export default defineComponent({
  components: {
    Card,
  },
  props: {
    amount: {
      type: Number,
      required: true,
    },
    cards: {
      type: Array,
      required: true,
    },
  },
  setup(props) {},
});
</script>

<style scoped>
.card-container {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  margin: 20px 0;
}

.card {
  margin: 0 10px;
  height: 100px;
  width: 100px;
  background-color: rgba(226, 141, 30, 0.719);

  display: table;
}

.card p {
  text-align: center;
  vertical-align: middle;

  display: table-cell;
}
</style>
