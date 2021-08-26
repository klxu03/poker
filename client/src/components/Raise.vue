<template>
  <button type="button">Check</button>
  <button type="button">Fold</button>

  <div class="slider-container">
    <input
      type="range"
      min="0"
      max="100"
      v-model="sliderValue"
      class="slider"
      :style="style"
    />
    <br />
    <button type="button">Raise {{ raiseValue }}</button>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  props: {
    max: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const sliderValue = ref((props.min * 100) / props.max);

    const style = computed(() => {
      const ret = `
        background: linear-gradient(
          to right,
          #82cfd0 0%,
          #82cfd0 ${sliderValue.value}%,
          #fff ${sliderValue.value}%,
          #fff 100%
        );
      `;
      // console.log('res', res);
      return ret;
    });

    const raiseValue = computed(() => {
      return Math.floor(props.max * (sliderValue.value / 100));
    });

    return {
      sliderValue,
      raiseValue,
      style,
    };
  },
});
</script>

<style scoped>
.slider-container {
  width: 100%;
}

.slider {
  /* Override defaults */
  -webkit-appearance: none;
  appearance: none;

  width: 60%;
  margin: 0 auto;
  height: 25px;
  border-radius: 10px;

  /* background: #d3d3d3; */
  /* background: url('../assets/orange.jpg'); */
  /* background: linear-gradient(
    to right,
    url('../assets/orange.jpg') 0%,
    url('../assets/orange.jpg') 50%,
    #fff 50%,
    #fff 100%
  ); */

  outline: none;
  opacity: 0.7;

  -webkit-transition: 0.2s;
  transition: opacity 0.2s;

  /* Makes it vertical */
  /* transform: rotate(90deg); */
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  /* Override defaults */
  -webkit-appearance: none;
  appearance: none;

  width: 25px;
  height: 25px;
  /* background: #04aa6d; */
  background: url('../assets/orange.jpg');

  border-radius: 50%;

  cursor: pointer;
}
</style>
