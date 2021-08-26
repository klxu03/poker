<template>
  <div class="card">
    <p>{{ card }}</p>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    card: {
      type: String,
      required: true,
    },
  },
  setup(props) {},
});
</script>

<style scoped>
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
