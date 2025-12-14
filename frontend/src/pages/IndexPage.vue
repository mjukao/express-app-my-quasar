<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold">Tasks</div>
        <div class="text-grey-7">
          Express + Prisma + Supabase • API: {{ API_URL }}
        </div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          outline
          icon="refresh"
          label="Reload"
          :loading="loading"
          @click="fetchTasks"
        />
        <q-btn
          color="primary"
          icon="add"
          label="New Task"
          @click="openCreate()"
        />
      </div>
    </div>

    <!-- Top stats + search -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-grey-7">Total tasks</div>
              <div class="text-h5 text-weight-bold">{{ tasks.length }}</div>
            </div>
            <q-icon name="checklist" size="32px" class="text-primary" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="row items-center q-gutter-sm">
            <q-input
              v-model="query"
              dense
              outlined
              clearable
              class="col"
              placeholder="Search title / description..."
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-btn
              outline
              icon="content_copy"
              label="Copy API URL"
              @click="copyText(API_URL)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Error banner -->
    <q-banner
      v-if="errorMessage"
      class="q-mb-md bg-red-1 text-red-9 rounded-borders"
      dense
      inline-actions
    >
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ errorMessage }}
      <template #action>
        <q-btn flat label="Try again" @click="fetchTasks" />
      </template>
    </q-banner>

    <!-- Loading -->
    <div v-if="loading" class="row justify-center q-my-xl">
      <q-spinner size="42px" />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Empty state -->
      <q-card
        v-if="filteredTasks.length === 0"
        flat
        bordered
        class="rounded-borders"
      >
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar size="48px" color="grey-2" text-color="grey-8" icon="inbox" />
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">
              ยังไม่มีงานให้แสดง
            </div>
            <div class="text-grey-7">
              ลองกด <b>New Task</b> เพื่อสร้างรายการ หรือสร้างผ่าน curl / Postman ก็ได้
            </div>
          </div>
          <q-btn color="primary" icon="add" label="New Task" @click="openCreate()" />
        </q-card-section>

        <q-separator />

        <q-card-section class="text-grey-8">
          <div class="text-caption q-mb-sm">ตัวอย่าง curl:</div>
          <q-card flat bordered class="bg-grey-1 rounded-borders">
            <q-card-section class="text-monospace" style="white-space: pre-wrap">
curl -X POST {{ API_URL }}/api/tasks \
-H "Content-Type: application/json" \
-d '{"title":"เรียน Lab 2.1","description":"ทดสอบ Supabase"}'
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

      <!-- List -->
      <div v-else class="row q-col-gutter-md">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card flat bordered class="rounded-borders">
            <q-card-section class="row items-start justify-between q-gutter-sm">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold ellipsis">
                  {{ task.title }}
                </div>
                <div class="text-grey-7 q-mt-xs" style="min-height: 40px">
                  {{ task.description || '— ไม่มีคำอธิบาย —' }}
                </div>
              </div>

              <q-btn
                flat
                round
                dense
                icon="content_copy"
                @click="copyText(task.id)"
              >
                <q-tooltip>Copy id</q-tooltip>
              </q-btn>
            </q-card-section>

            <q-separator />

            <q-card-section class="row items-center justify-between">
              <q-badge outline color="primary">
                {{ formatDate(task.createdAt) }}
              </q-badge>

              <q-chip dense square icon="database" class="bg-grey-2">
                Supabase
              </q-chip>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Create dialog -->
    <q-dialog v-model="createDialog">
      <q-card style="width: 520px; max-width: 95vw" class="rounded-borders">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-weight-bold">Create new task</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.title"
            outlined
            label="Title"
            :error="!!formError"
            :error-message="formError"
            maxlength="80"
            counter
          />
          <q-input
            v-model="form.description"
            outlined
            label="Description (optional)"
            type="textarea"
            autogrow
            maxlength="280"
            counter
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Create"
            :loading="creating"
            @click="createTask"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { Notify, copyToClipboard } from 'quasar'

// อ่านค่าจาก quasar.config → build.env.API_URL
const API_URL = process.env.API_URL || 'http://localhost:3000'

const tasks = ref([])
const loading = ref(false)
const errorMessage = ref('')

const query = ref('')

const filteredTasks = computed(() => {
  const q = (query.value || '').trim().toLowerCase()
  if (!q) return tasks.value
  return tasks.value.filter((t) => {
    const title = (t.title || '').toLowerCase()
    const desc = (t.description || '').toLowerCase()
    return title.includes(q) || desc.includes(q)
  })
})

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return String(iso)
  }
}

const copyText = async (text) => {
  try {
    await copyToClipboard(String(text))
    Notify.create({ type: 'positive', message: 'Copied to clipboard' })
  } catch {
    Notify.create({ type: 'negative', message: 'Copy failed' })
  }
}

const fetchTasks = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.get(API_URL + '/api/tasks')
    tasks.value = res.data.data || []
  } catch (err) {
    console.error('API /api/tasks error:', err)
    errorMessage.value = 'โหลดงานจากฐานข้อมูลไม่สำเร็จ'
    Notify.create({ type: 'negative', message: 'Load tasks failed' })
  } finally {
    loading.value = false
  }
}

/** Create task */
const createDialog = ref(false)
const creating = ref(false)
const form = ref({ title: '', description: '' })
const formError = ref('')

const openCreate = () => {
  form.value = { title: '', description: '' }
  formError.value = ''
  createDialog.value = true
}

const createTask = async () => {
  formError.value = ''
  const title = (form.value.title || '').trim()
  const description = (form.value.description || '').trim()

  if (!title) {
    formError.value = 'กรุณาระบุ title'
    return
  }

  creating.value = true
  try {
    await axios.post(API_URL + '/api/tasks', {
      title,
      description: description ? description : null,
    })
    Notify.create({ type: 'positive', message: 'Created task' })
    createDialog.value = false
    await fetchTasks()
  } catch (err) {
    console.error('CREATE error:', err)
    Notify.create({ type: 'negative', message: 'Create task failed' })
  } finally {
    creating.value = false
  }
}

onMounted(fetchTasks)
</script>
