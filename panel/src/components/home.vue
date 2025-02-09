<template>
  <div class="home-container">
    <!-- 文件选择器 -->
    <div class="file-selector">
      <label for="file-select">选择用户数据文件(默认根据系统语言自动加载)：</label>
      <div class="select-container">
        <div class="custom-select">
          <select id="file-select" v-model="selectedFile">
            <option value="">请选择文件</option>
            <option v-for="file in fileList" :key="file.path" :value="file.name">
              {{ file.name }}
            </option>
          </select>
          <span class="custom-arrow"></span>
        </div>
        <button class="confirm-btn" :disabled="!selectedFile" @click="handleFileChange">
          确认切换
        </button>
      </div>
    </div>

    <!-- YAML转换器 -->
    <div class="yaml-converter">
      <h3>YAML文件读取，存入Tag用户数据中（注意：如果数据过多处理速度会很慢）</h3>
      <div class="input-group">
        <div class="file-input-container">
          <div>
            <h5>路径格式例子：E:/Downloads/userdatas_zh_CN.yaml</h5>
            <h5>如果已经存在的对应tag路径，则不会重复创建，前提是tag的一级目录和二级目录的名称是一样的</h5>
          </div>
          <input type="text" v-model="yamlFilePath" placeholder="输入YAML文件绝对路径">
        </div>
      </div>
      <button class="convert-btn" :disabled="!yamlFilePath.trim()" @click="handleConvertYaml">
        开始处理
      </button>
      <div v-if="convertStatus" class="status-message">
        {{ convertStatus }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { base_url } from '@/config'

const fileList = ref([])
const selectedFile = ref('')
const yamlFilePath = ref('')
const convertStatus = ref('')

// 获取文件列表
const fetchFileList = async () => {
  try {
    const response = await axios.get(base_url + '/api/file_list')
    fileList.value = response.data.data.filter(file => file.path.endsWith('.db'))
  } catch (error) {
    console.error('获取文件列表失败:', error)
  }
}

// 处理文件切换
const handleFileChange = async () => {
  if (!selectedFile.value) return

  try {
    const languageCode = selectedFile.value
      .replace(/^userdatas_/, '')
      .replace(/\.db$/, '')

    const response = await axios.post(base_url + '/api/set_language', {
      name: languageCode
    })

    if (response.data.status === "success") {
      alert(`成功切换到语言：${languageCode}`)
    } else {
      throw new Error(response.data.message || '切换失败')
    }
  } catch (error) {
    console.error('文件切换失败:', error)
    alert(`文件切换失败：${error.message}`)
  }
}

// 处理YAML转换
const handleConvertYaml = async () => {
  if (!yamlFilePath.value) return

  try {
    convertStatus.value = '转换中...'
    const response = await axios.post(base_url + '/api/convert_yaml', {
      yaml_file: yamlFilePath.value,
    })

    if (response.data.status === "success") {
      convertStatus.value = '转换成功！'
      alert('YAML文件转换成功')
    } else {
      throw new Error(response.data.message || '转换失败')
    }
  } catch (error) {
    console.error('YAML转换失败:', error)
    convertStatus.value = `转换失败：${error.message}`
    alert(`YAML转换失败：${error.message}`)
  } finally {
    setTimeout(() => {
      convertStatus.value = ''
    }, 5000)
  }
}

onMounted(() => {
  fetchFileList()
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.file-selector,
.yaml-converter {
  margin-bottom: 30px;
}

.file-selector label,
.yaml-converter label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.select-container {
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 500px;
}

.input-group {
  margin-bottom: 15px;
}

input[type="text"] {
  width: 100%;
  max-width: 500px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
}

input[type="text"]:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.confirm-btn,
.convert-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-btn:disabled,
.convert-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.confirm-btn:not(:disabled):hover,
.convert-btn:not(:disabled):hover {
  background-color: #0056b3;
}

.status-message {
  margin-top: 10px;
  color: #28a745;
  font-weight: bold;
}

.file-input-container {
  display: flex;
  flex-direction: column;
}

.file-select-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background-color: #6c757d;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-select-btn:hover {
  background-color: #5a6268;
}

.file-selector-input {
  display: none;
}

.custom-select {
  position: relative;
  width: 100%;
  max-width: 300px;
}

#file-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  padding: 10px 35px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

#file-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.custom-arrow {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #666;
  pointer-events: none;
  transition: transform 0.2s ease;
}

#file-select:hover {
  border-color: #007bff;
}

#file-select:hover+.custom-arrow {
  border-top-color: #007bff;
}

#file-select:focus+.custom-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* 针对不同浏览器的兼容性 */
@supports (-moz-appearance: none) {
  #file-select {
    padding-right: 25px;
  }
}
</style>