<template>
  <div>
    <h1>Player Chip Amount: {{ amount }}</h1>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    amount: {
      type: Number,
      required: true,
    },
  },
  setup(props) {},
});
</script>

<style scoped></style>
