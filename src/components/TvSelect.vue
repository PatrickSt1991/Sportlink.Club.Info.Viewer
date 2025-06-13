<template>
  <div 
    ref="selectContainer"
    class="tv-select-container" 
    :class="{ 'is-open': isOpen }"
    tabindex="0"
    @keydown="handleKeydown"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <div class="tv-select-display" @click="toggleDropdown">
      {{ displayValue || placeholder }}
    </div>
    <div v-if="isOpen" class="tv-select-options">
      <div
        v-for="(option, index) in options"
        :key="getOptionValue(option)"
        :class="{
          'tv-select-option': true,
          'is-selected': index === selectedIndex,
          'is-focused': index === focusedIndex
        }"
        @click="selectOption(option)"
      >
        {{ getOptionLabel(option) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  placeholder: {
    type: String,
    default: 'Select...'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const selectContainer = ref(null);
const isOpen = ref(false);
const selectedIndex = ref(-1);
const focusedIndex = ref(0);

const displayValue = computed(() => {
  const selected = props.options.find(
    opt => getOptionValue(opt) === getOptionValue(props.modelValue)
  );
  return selected ? getOptionLabel(selected) : '';
});

function getOptionLabel(option) {
  return option?.[props.optionLabel] ?? option;
}

function getOptionValue(option) {
  return option?.[props.optionValue] ?? option;
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // Set initial focus to current selection or first option
    focusedIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0;
    // Ensure focus stays on container
    selectContainer.value?.focus();
  }
}

function selectOption(option) {
  emit('update:modelValue', option);
  emit('change', option);
  isOpen.value = false;
  // Update selected index
  selectedIndex.value = props.options.findIndex(
    opt => getOptionValue(opt) === getOptionValue(option)
  );
}

function handleKeydown(e) {
  switch (e.key) {
    case 'Enter':
    case 'Return':
    case 'OK':
      e.preventDefault();
      e.stopPropagation();
      if (!isOpen.value) {
        // Force open dropdown
        isOpen.value = true;
        // Focus first option
        focusedIndex.value = 0;
        // Ensure focus stays on container
        selectContainer.value?.focus();
      } else {
        // Select current option if dropdown is open
        const option = props.options[focusedIndex.value];
        if (option) {
          selectOption(option);
        }
      }
      break;
    case 'ArrowUp':
    case 'Up':
      e.preventDefault();
      if (isOpen.value) {
        // Navigate options when open
        focusedIndex.value = Math.max(0, focusedIndex.value - 1);
      }
      break;
    case 'ArrowDown':
    case 'Down':
      e.preventDefault();
      if (isOpen.value) {
        // Navigate options when open
        focusedIndex.value = Math.min(props.options.length - 1, focusedIndex.value + 1);
      }
      break;
    case 'ArrowLeft':
    case 'Left':
      e.preventDefault();
      isOpen.value = false;
      // Move focus to previous element
      const prevElement = e.target.closest('.tv-form-group')?.previousElementSibling?.querySelector('select, input, button, [tabindex="0"]');
      if (prevElement) {
        prevElement.focus();
      }
      break;
    case 'ArrowRight':
    case 'Right':
      e.preventDefault();
      isOpen.value = false;
      // Move focus to next element
      const nextElement = e.target.closest('.tv-form-group')?.nextElementSibling?.querySelector('select, input, button, [tabindex="0"]');
      if (nextElement) {
        nextElement.focus();
      }
      break;
  }
}

function handleFocus() {
  // Add focus class for Tizen
  selectContainer.value?.classList.add('has-focus');
}

function handleBlur(e) {
  // Only close if we're not clicking inside the component
  if (!selectContainer.value?.contains(e.relatedTarget)) {
    isOpen.value = false;
  }
  // Remove focus class for Tizen
  selectContainer.value?.classList.remove('has-focus');
}

// Update selected index when model value changes
watch(() => props.modelValue, (newValue) => {
  selectedIndex.value = props.options.findIndex(
    opt => getOptionValue(opt) === getOptionValue(newValue)
  );
}, { immediate: true });

// Expose focus method for parent components
defineExpose({
  focus: () => {
    selectContainer.value?.focus();
    // Double focus for older Tizen
    setTimeout(() => {
      selectContainer.value?.focus();
    }, 100);
  }
});
</script>

<style scoped>
.tv-select-container {
  position: relative;
  width: 100%;
  background: white;
  border: 2px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}

.tv-select-container:focus,
.tv-select-container.has-focus {
  outline: 4px solid #007bff !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
  border-color: #007bff;
}

.tv-select-container.is-open {
  border-color: #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
}

.tv-select-display {
  padding: 12px 15px;
  min-height: 20px;
}

.tv-select-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #007bff;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.tv-select-option {
  padding: 12px 15px;
  cursor: pointer;
}

.tv-select-option:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.tv-select-option.is-focused {
  background-color: rgba(0, 123, 255, 0.2) !important;
  outline: 2px solid #007bff !important;
}

.tv-select-option.is-selected {
  background-color: rgba(0, 123, 255, 0.1) !important;
  font-weight: bold;
}

/* Scrollbar styles for Tizen */
.tv-select-options::-webkit-scrollbar {
  width: 8px;
}

.tv-select-options::-webkit-scrollbar-thumb {
  background-color: rgba(0, 123, 255, 0.5);
  border-radius: 4px;
}

.tv-select-options::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
}
</style> 