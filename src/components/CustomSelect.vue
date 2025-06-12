<template>
  <div
    class="custom-select"
    :class="{ focused: isFocused }"
    tabindex="0"
    @keydown="handleKeydown"
    @focus="onFocus"
    @blur="onBlur"
  >
    <span class="selected-label">{{ displayLabel }}</span>
    <ul v-if="isFocused" class="options">
      <li
        v-for="(option, index) in options"
        :key="getOptionValue(option)"
        :class="{ highlighted: index === highlightedIndex, disabled: isDisabled(option) }"
      >
        {{ getOptionLabel(option) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: [String, Object],
  options: Array,
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  }
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);
const highlightedIndex = ref(0);

const onFocus = () => {
  isFocused.value = true;
  highlightedIndex.value = currentIndex.value ?? 0;
};

const onBlur = () => {
  isFocused.value = false;
};

const getOptionLabel = (option) => option?.[props.optionLabel];
const getOptionValue = (option) => option?.[props.optionValue] ?? option;
const isDisabled = (option) => option?.disabled || false;

const currentIndex = computed(() =>
  props.options.findIndex(
    (opt) => getOptionValue(opt) === getOptionValue(props.modelValue)
  )
);

const displayLabel = computed(() => {
  const selected = props.options.find(
    (opt) => opt[props.optionValue] === props.modelValue
  );
  return selected ? selected[props.optionLabel] : 'Kies';
});


const handleKeydown = (e) => {
  if (!isFocused.value) return;

  if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
    e.preventDefault();
    moveHighlight(e.key === 'ArrowDown' ? 1 : -1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const selected = props.options[highlightedIndex.value];
    if (!isDisabled(selected)) {
      emit('update:modelValue', selected);
      isFocused.value = false; // Close dropdown
    }
  } else if (e.key === 'Escape') {
    isFocused.value = false;
  }
};

const moveHighlight = (direction) => {
  const max = props.options.length;
  let newIndex = highlightedIndex.value;
  for (let i = 0; i < max; i++) {
    newIndex = (newIndex + direction + max) % max;
    if (!isDisabled(props.options[newIndex])) {
      highlightedIndex.value = newIndex;
      break;
    }
  }
};
</script>

<style scoped>
.custom-select {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
  position: relative;
  cursor: pointer;
  width: 100%;
}

.custom-select.focused {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
}

.selected-label {
  display: block;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  margin: 0;
  padding: 0;
}

.options li {
  padding: 8px;
  cursor: pointer;
}

.options li.highlighted {
  background: #4a90e2;
  color: white;
}

.options li.disabled {
  color: #aaa;
  cursor: not-allowed;
}
</style>
