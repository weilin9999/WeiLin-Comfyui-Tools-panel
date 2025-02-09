<template>
  <div class="color-picker">
    <div class="color-preview" :style="{ backgroundColor: rgbaValue }"></div>
    <input type="color" v-model="hexColor" @input="updateColor" />
    <label>Opacity:</label>
    <input type="range" v-model="alpha" min="0" max="1" step="0.01" @input="updateColor" />
    <div class="color-values">
      <span>RGBA: {{ rgbaValue }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'rgba(255,255,255,1)'
  }
})

const emit = defineEmits(['update:modelValue'])

// 解析RGBA颜色
const parseRGBA = (rgba) => {
  try {
    if (!rgba || typeof rgba !== 'string') {
      return { r: 255, g: 255, b: 255, a: 1 }
    }
    
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (!match) {
      return { r: 255, g: 255, b: 255, a: 1 }
    }
    
    return {
      r: Math.min(255, Math.max(0, parseInt(match[1]))),
      g: Math.min(255, Math.max(0, parseInt(match[2]))),
      b: Math.min(255, Math.max(0, parseInt(match[3]))),
      a: Math.min(1, Math.max(0, parseFloat(match[4] || 1)))
    }
  } catch (e) {
    console.error('Error parsing color:', e)
    return { r: 255, g: 255, b: 255, a: 1 }
  }
}

// 初始化颜色值
const initialColor = parseRGBA(props.modelValue)
const alpha = ref(initialColor.a)

// 将RGB转换为16进制
const toHex = (c) => {
  const hex = Math.round(c).toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

const hexColor = ref(`#${toHex(initialColor.r)}${toHex(initialColor.g)}${toHex(initialColor.b)}`)

// 计算rgba值
const rgbaValue = computed(() => {
  try {
    const hex = hexColor.value.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha.value})`
  } catch (e) {
    console.error('Error calculating rgba:', e)
    return 'rgba(255,255,255,1)'
  }
})

// 更新颜色
const updateColor = () => {
  emit('update:modelValue', rgbaValue.value)
}

// 监听外部modelValue变化
watch(() => props.modelValue, (newVal) => {
  const { r, g, b, a } = parseRGBA(newVal)
  hexColor.value = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  alpha.value = a
}, { immediate: true })
</script>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0;
}

.color-preview {
  width: 100%;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.color-values {
  font-size: 0.9em;
  color: #666;
  text-align: center;
}

input[type="color"] {
  width: 100%;
  height: 40px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input[type="range"] {
  width: 100%;
}
</style> 