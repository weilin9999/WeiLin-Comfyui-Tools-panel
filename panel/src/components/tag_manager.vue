<template>
  <div class="container">
    <h1>Tag Manager</h1>
    <div class="tag-manager">
      <div class="tag-groups">
        <h2>Tag Groups</h2>
        <ul>
          <li v-for="group in tagGroups" :key="group.id_index">
            <div class="item-content" :style="{ backgroundColor: group.color }" @click="selectGroup(group)">
              <span>{{ group.name }}</span>
            </div>
            <div class="item-controls">
              <button @click="openEditTagGroupModal(group)">Edit</button>
              <button @click="deleteTagGroup(group.id_index)">Delete</button>
              <button @click="openMoveItemModal(group, 'before', 'group')">Move</button>
            </div>
          </li>
        </ul>
        <button @click="openAddTagGroupModal">Add Tag Group</button>
      </div>
      <div class="tag-subgroups" v-if="selectedGroup">
        <h2>Tag Subgroups</h2>
        <ul>
          <li v-for="subgroup in subgroups" :key="subgroup.id_index">
            <div class="item-content" :style="{ backgroundColor: subgroup.color }" @click="selectSubgroup(subgroup)">
              <span>{{ subgroup.name }}</span>
            </div>
            <div class="item-controls">
              <button @click="openEditTagSubgroupModal(subgroup)">Edit</button>
              <button @click="deleteTagSubgroup(subgroup.id_index)">Delete</button>
              <button @click="openMoveItemModal(subgroup, 'before', 'subgroup')">Move</button>
            </div>
          </li>
        </ul>
        <button @click="openAddTagSubgroupModal(selectedGroup.id_index)">Add Subgroup</button>
      </div>
      <div class="tags" v-if="selectedSubgroup">
        <h2>Tags</h2>
        <ul>
          <li v-for="tag in tags" :key="tag.id_index">
            <div class="item-content-tag" :style="{ backgroundColor: tag.color }">
              <span>{{ tag.desc }}</span>
              <span class="item-tag-tag">{{ tag.text }}</span>
            </div>
            <div class="item-controls">
              <button @click="openEditTagModal(tag)">Edit</button>
              <button @click="deleteTag(tag.id_index)">Delete</button>
              <button @click="openMoveItemModal(tag, 'before', 'tag')">Move</button>
            </div>
          </li>
        </ul>
        <button @click="openAddTagModal(selectedSubgroup.id_index)">Add Tag</button>
      </div>
    </div>

    <!-- Add/Edit Tag Group Modal -->
    <div v-if="showTagGroupModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeTagGroupModal">&times;</span>
        <h2>{{ isEditTagGroup ? 'Edit Tag Group' : 'Add Tag Group' }}</h2>
        <form @submit.prevent="isEditTagGroup ? editTagGroup() : addTagGroup()">
          <label for="tagGroupName">Name:</label>
          <input type="text" id="tagGroupName" v-model="tagGroupName" required>

          <label>Color:</label>
          <ColorPicker v-model="tagGroupColor" />

          <button type="submit">{{ isEditTagGroup ? 'Save' : 'Add' }}</button>
        </form>
      </div>
    </div>

    <!-- Add/Edit Tag Subgroup Modal -->
    <div v-if="showTagSubgroupModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeTagSubgroupModal">&times;</span>
        <h2>{{ isEditTagSubgroup ? 'Edit Tag Subgroup' : 'Add Tag Subgroup' }}</h2>
        <form @submit.prevent="isEditTagSubgroup ? editTagSubgroup() : addTagSubgroup()">
          <label for="tagSubgroupName">Name:</label>
          <input type="text" id="tagSubgroupName" v-model="tagSubgroupName" required>

          <label>Color:</label>
          <ColorPicker v-model="tagSubgroupColor" />

          <button type="submit">{{ isEditTagSubgroup ? 'Save' : 'Add' }}</button>
        </form>
      </div>
    </div>

    <!-- Add/Edit Tag Modal -->
    <div v-if="showTagModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeTagModal">&times;</span>
        <h2>{{ isEditTag ? 'Edit Tag' : 'Add Tag' }}</h2>
        <form @submit.prevent="isEditTag ? editTag() : addTag()">
          <label for="tagText">Description:</label>
          <input type="text" id="tagText" v-model="tagDesc" required>

          <label for="tagDesc">Tag:</label>
          <textarea id="tagDesc" v-model="tagText" required class="styled-textarea"
            placeholder="Enter your tag content here..." rows="4"></textarea>

          <label>Color:</label>
          <ColorPicker v-model="tagColor" />

          <button type="submit">{{ isEditTag ? 'Save' : 'Add' }}</button>
        </form>
      </div>
    </div>

    <!-- Move Item Modal -->
    <div v-if="showMoveTagModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeMoveTagModal">&times;</span>
        <h2>Move Item</h2>
        <form @submit.prevent="moveItem()">
          <label for="referenceItemId">Reference Item:</label>
          <select id="referenceItemId" v-model="referenceItemId" required>
            <option v-for="item in referenceItems" :key="item.id_index" :value="item.id_index">
              <div v-if="currentType === 'tag'" >
                {{ item.desc + ' ==> ' + (item.text.length > 30 ? item.text.slice(0, 30) + '...' : item.text) }}
              </div>
              <div v-else>
                {{ item.name }}
              </div>
            </option>
          </select>
          <label for="position">Position:</label>
          <select id="position" v-model="position" required>
            <option value="before">Before</option>
            <option value="after">After</option>
          </select>
          <button type="submit">Move</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { base_url } from '@/config'
import ColorPicker from './ColorPicker.vue'

const tagGroups = ref([])
const subgroups = ref([])
const tags = ref([])
const selectedGroup = ref(null)
const selectedSubgroup = ref(null)

const showTagGroupModal = ref(false)
const showTagSubgroupModal = ref(false)
const showTagModal = ref(false)
const showMoveTagModal = ref(false)

const isEditTagGroup = ref(false)
const isEditTagSubgroup = ref(false)
const isEditTag = ref(false)

const tagGroupName = ref('')
const tagGroupColor = ref('rgba(255,255,255,1)')
const tagSubgroupName = ref('')
const tagSubgroupColor = ref('rgba(255,255,255,1)')
const tagText = ref('')
const tagDesc = ref('')
const tagColor = ref('rgba(255,255,255,1)')

const currentGroup = ref(null)
const currentSubgroup = ref(null)
const currentTag = ref(null)
const currentItem = ref(null)
const currentType = ref('')

const referenceItemId = ref('')
const referenceItems = ref([])
const position = ref('')

const tagGroupAlpha = ref(1)
const tagSubgroupAlpha = ref(1)
const tagAlpha = ref(1)

const props = defineProps({
  modelValue: {
    type: String,
    default: 'rgba(255,255,255,1)'
  }
})

const emit = defineEmits(['update:modelValue'])

// 更安全的RGBA解析函数
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

const fetchTagGroups = async () => {
  try {
    const response = await axios.get(`${base_url}/tag/get_tag_groups`)
    tagGroups.value = response.data.data
  } catch (error) {
    console.error('Error fetching tag groups:', error)
  }
}

const fetchTagSubgroups = async (group_id) => {
  try {
    const response = await axios.get(`${base_url}/tag/get_tag_subgroups`, {
      params: { group_id }
    })
    subgroups.value = response.data.data
  } catch (error) {
    console.error('Error fetching tag subgroups:', error)
  }
}

const fetchTags = async (subgroup_id) => {
  try {
    const response = await axios.get(`${base_url}/tag/get_tags`, {
      params: { subgroup_id }
    })
    tags.value = response.data.data
  } catch (error) {
    console.error('Error fetching tags:', error)
  }
}

const rgbaToRgbText = (color, alpha) => {
  const formattedColor = color && !color.startsWith('#') ? `#${color}` : color;

  if (!formattedColor || typeof formattedColor !== 'string' || !/^#([0-9A-F]{3}){1,2}$/i.test(formattedColor)) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  let hex = formattedColor.slice(1);
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const validAlpha = Math.min(1, Math.max(0, alpha));

  return `rgba(${r}, ${g}, ${b}, ${validAlpha})`;
}

const selectGroup = (group) => {
  selectedGroup.value = group
  selectedSubgroup.value = null
  subgroups.value = []
  tags.value = []
  fetchTagSubgroups(group.id_index)
}

const selectSubgroup = (subgroup) => {
  selectedSubgroup.value = subgroup
  tags.value = []
  fetchTags(subgroup.id_index)
}

const openAddTagGroupModal = () => {
  tagGroupName.value = ''
  tagGroupColor.value = ''
  isEditTagGroup.value = false
  showTagGroupModal.value = true
}

const openEditTagGroupModal = (group) => {
  currentGroup.value = group
  tagGroupName.value = group.name
  tagGroupColor.value = group.color ? `${group.color.replace(/^#/, '')}` : '#ff7b02'
  tagGroupAlpha.value = group.alpha || 1
  isEditTagGroup.value = true
  showTagGroupModal.value = true
}

const closeTagGroupModal = () => {
  showTagGroupModal.value = false
}

const addTagGroup = async () => {
  try {
    await axios.post(`${base_url}/tag/add_tag_group`, { name: tagGroupName.value, color: tagGroupColor.value })
    fetchTagGroups()
    closeTagGroupModal()
  } catch (error) {
    console.error('Error adding tag group:', error)
  }
}

const editTagGroup = async () => {
  try {
    await axios.post(`${base_url}/tag/edit_tag_group`, {
      id_index: currentGroup.value.id_index,
      name: tagGroupName.value,
      color: tagGroupColor.value,
      alpha: tagGroupAlpha.value
    })
    fetchTagGroups()
    closeTagGroupModal()
  } catch (error) {
    console.error('Error editing tag group:', error)
  }
}

const deleteTagGroup = async (id_index) => {
  if (confirm('Are you sure you want to delete this tag group?')) {
    try {
      await axios.post(`${base_url}/tag/delete_tag_group`, { id_index })
      fetchTagGroups()
    } catch (error) {
      console.error('Error deleting tag group:', error)
    }
  }
}

const openMoveItemModal = (item, pos, type) => {
  currentItem.value = item
  position.value = pos
  currentType.value = type
  referenceItemId.value = ''
  loadReferenceItems(type)
  showMoveTagModal.value = true
}

const loadReferenceItems = (type) => {
  if (type === 'group') {
    referenceItems.value = tagGroups.value
  } else if (type === 'subgroup') {
    referenceItems.value = subgroups.value
  } else if (type === 'tag') {
    referenceItems.value = tags.value
  }
}

const moveItem = async () => {
  try {
    let url = ''
    if (currentType.value === 'group') {
      url = `${base_url}/tag/move_tag_group`
    } else if (currentType.value === 'subgroup') {
      url = `${base_url}/tag/move_tag_subgroup`
    } else if (currentType.value === 'tag') {
      url = `${base_url}/tag/move_tag`
    }
    await axios.post(url, { id_index: currentItem.value.id_index, reference_id_index: referenceItemId.value, position: position.value })
    if (currentType.value === 'group') {
      fetchTagGroups()
    } else if (currentType.value === 'subgroup') {
      fetchTagSubgroups(selectedGroup.value.id_index)
    } else if (currentType.value === 'tag') {
      fetchTags(selectedSubgroup.value.id_index)
    }
    closeMoveTagModal()
  } catch (error) {
    console.error('Error moving item:', error)
  }
}

const closeMoveTagModal = () => {
  showMoveTagModal.value = false
}

const openAddTagSubgroupModal = (group_id) => {
  currentGroup.value = group_id
  tagSubgroupName.value = ''
  tagSubgroupColor.value = ''
  isEditTagSubgroup.value = false
  showTagSubgroupModal.value = true
}

const openEditTagSubgroupModal = (subgroup) => {
  currentSubgroup.value = subgroup
  tagSubgroupName.value = subgroup.name
  tagSubgroupColor.value = subgroup.color ? `${subgroup.color.replace(/^#/, '')}` : '#ff7b02'
  tagSubgroupAlpha.value = subgroup.alpha || 1
  isEditTagSubgroup.value = true
  showTagSubgroupModal.value = true
}

const closeTagSubgroupModal = () => {
  showTagSubgroupModal.value = false
}

const addTagSubgroup = async () => {
  try {
    await axios.post(`${base_url}/tag/add_tag_subgroup`, { group_id: currentGroup.value, name: tagSubgroupName.value, color: tagSubgroupColor.value })
    fetchTagSubgroups(currentGroup.value)
    closeTagSubgroupModal()
  } catch (error) {
    console.error('Error adding tag subgroup:', error)
  }
}

const editTagSubgroup = async () => {
  try {
    await axios.post(`${base_url}/tag/edit_tag_subgroup`, {
      id_index: currentSubgroup.value.id_index,
      name: tagSubgroupName.value,
      color: tagSubgroupColor.value,
      alpha: tagSubgroupAlpha.value
    })
    fetchTagSubgroups(currentSubgroup.value.group_id)
    closeTagSubgroupModal()
  } catch (error) {
    console.error('Error editing tag subgroup:', error)
  }
}

const deleteTagSubgroup = async (id_index) => {
  if (confirm('Are you sure you want to delete this tag subgroup?')) {
    try {
      await axios.post(`${base_url}/tag/delete_tag_subgroup`, { id_index })
      fetchTagSubgroups(selectedGroup.value.id_index)
    } catch (error) {
      console.error('Error deleting tag subgroup:', error)
    }
  }
}

const openAddTagModal = (subgroup_id) => {
  currentSubgroup.value = subgroup_id
  tagText.value = ''
  tagDesc.value = ''
  tagColor.value = ''
  isEditTag.value = false
  showTagModal.value = true
}

const openEditTagModal = (tag) => {
  currentTag.value = tag
  tagText.value = tag.text
  tagDesc.value = tag.desc
  tagColor.value = tag.color ? `${tag.color.replace(/^#/, '')}` : '#ff7b02'
  tagAlpha.value = tag.alpha || 1
  isEditTag.value = true
  showTagModal.value = true
}

const closeTagModal = () => {
  showTagModal.value = false
}

const addTag = async () => {
  try {
    await axios.post(`${base_url}/tag/add_tag`, { subgroup_id: currentSubgroup.value, text: tagText.value, desc: tagDesc.value, color: tagColor.value })
    fetchTags(currentSubgroup.value)
    closeTagModal()
  } catch (error) {
    console.error('Error adding tag:', error)
  }
}

const editTag = async () => {
  try {
    await axios.post(`${base_url}/tag/edit_tag`, {
      id_index: currentTag.value.id_index,
      text: tagText.value,
      desc: tagDesc.value,
      color: tagColor.value,
      alpha: tagAlpha.value
    })
    fetchTags(currentTag.value.subgroup_id)
    closeTagModal()
  } catch (error) {
    console.error('Error editing tag:', error)
  }
}

const deleteTag = async (id_index) => {
  if (confirm('Are you sure you want to delete this tag?')) {
    try {
      await axios.post(`${base_url}/tag/delete_tag`, { id_index })
      fetchTags(selectedSubgroup.value.id_index)
    } catch (error) {
      console.error('Error deleting tag:', error)
    }
  }
}

onMounted(fetchTagGroups)
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  box-sizing: border-box;
  height: 100%;
}

.tag-manager {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
  gap: 20px;
  height: 100%;
}

.tag-groups,
.tag-subgroups,
.tags {
  flex: 1;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 75vh;
  overflow-y: auto;
  max-width: 35%;
}

h1 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
}

h2 {
  font-size: 22px;
  margin-top: 20px;
  color: #555;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.item-content {
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.item-content:hover {
  background-color: #f0f0f0;
}

.item-content-tag {
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: background-color 0.3s;
  display: flex;
  flex-direction: column;
}

.item-tag-tag {
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 10px;
  overflow: hidden;
  padding: 6px;
}

.item-controls {
  display: flex;
  justify-content: space-between;
}

button {
  margin-left: 5px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  padding: 4px;
}

button:hover {
  background-color: #0056b3;
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-in-out;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
}

label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}

input[type="text"],
input[type="color"],
select {
  width: calc(100% - 20px);
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  margin-top: 3px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  padding: 4px;
}

button:hover {
  background-color: #0056b3;
}


@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.styled-textarea {
  width: 90%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 15px;
}

.styled-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  background-color: #fff;
}

.styled-textarea::placeholder {
  color: #999;
  opacity: 1;
}

.styled-textarea:hover {
  border-color: #bbb;
}
</style>