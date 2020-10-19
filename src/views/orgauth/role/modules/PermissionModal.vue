<template>
  <a-modal
    title="权限列表"
    :width="900"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="model && model.id > 0" label="主键ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="角色名称">
          <a-input v-decorator="['roleNameZh']" disabled/>
        </a-form-item>
        <a-form-item label="成员列表">
          <a-transfer
            :data-source="mockData"
            :list-style="{
              width: '250px',
              height: '300px',
            }"
            show-search
            :filter-option="filterOption"
            :target-keys="targetKeys"
            :render="item => item.title+'-'+item.description"
            @change="handleChange"
            @search="handleSearch"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

import { getPermissionByRoleId } from '@/api/lanson'
// 表单字段
const fields = ['roleNameZh', 'id']

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    this.formLayout = {
      labelCol: {
        xs: { span: 5 },
        sm: { span: 3 }
      },
      wrapperCol: {
        xs: { span: 43 },
        sm: { span: 17 }
      }
    }
    return {
      form: this.$form.createForm(this),
      mockData: [],
      targetKeys: []
    }
  },
  created () {
    console.log('Role modal created')

    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
      this.getMock()
    })
  },
  methods: {
    getMock () {
      getPermissionByRoleId(this.model.id)
        .then(res => {
          if (res && res.result === 'ok') {
            this.mockData = res.data.all
            this.targetKeys = res.data.select
          }
        })
    },
    filterOption (inputValue, option) {
      return option.description.indexOf(inputValue) > -1 || option.title.indexOf(inputValue) > -1
    },
    handleChange (targetKeys, direction, moveKeys) {
      console.log(targetKeys, direction, moveKeys)
      this.targetKeys = targetKeys
    },
    handleSearch (dir, value) {
      console.log('search:', dir, value)
    }
  }
}
</script>
