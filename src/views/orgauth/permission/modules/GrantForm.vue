<template>
  <a-modal
    title="配置"
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
        <a-form-item label="权限名称">
          <a-input v-decorator="['authorityName']" disabled/>
        </a-form-item>
        <a-form-item label="权限描述">
          <a-input v-decorator="['authorityDesc']" disabled/>
        </a-form-item>
        <a-form-item label="客户代码">
          <a-transfer
            :data-source="mockData"
            :list-style="{
              width: '180px',
              height: '300px',
            }"
            show-search
            :filter-option="filterOption"
            :target-keys="targetKeys"
            :render="item => item.title"
            @change="handleChange"
            @search="handleSearch"
          />
        </a-form-item>
        <a-form-item label="公司代码">
          <a-transfer
            :data-source="companyData"
            :list-style="{
              width: '180px',
              height: '200px',
            }"
            show-search
            :filter-option="filterOption_com"
            :target-keys="targetCompanyKeys"
            :render="item => item.title+'-'+item.description"
            @change="handleChange_com"
            @search="handleSearch_com"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getCustomers, getCompanys } from '@/api/lanson'
// 表单字段
const fields = ['authorityName', 'id', 'authorityDesc']

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
        xs: { span: 12 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 36 },
        sm: { span: 13 }
      }
    }
    return {
      form: this.$form.createForm(this),
      mockData: [],
      targetKeys: [],
      companyData: [],
      targetCompanyKeys: []
    }
  },
  created () {
    console.log('custom modal created')

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
      getCustomers(this.model.id)
        .then(res => {
          console.log(res)
          if (res && res.result === 'ok') {
            this.mockData = res.data.all
            this.targetKeys = res.data.select
          }
        })
       getCompanys(this.model.id).then(res => {
         if (res && res.result === 'ok') {
           this.companyData = res.data.all
           this.targetCompanyKeys = res.data.select
         }
       })
    },
    filterOption (inputValue, option) {
      console.log(inputValue)
      return option.title.indexOf(inputValue) > -1
    },
    handleChange (targetKeys, direction, moveKeys) {
      console.log(targetKeys, direction, moveKeys)
      this.targetKeys = targetKeys
    },
    handleSearch (dir, value) {
      console.log('search:', dir, value)
    },
    filterOption_com (inputValue, option) {
      return option.description.indexOf(inputValue) > -1 || option.title.indexOf(inputValue) > -1
    },
    handleChange_com (targetKeys, direction, moveKeys) {
      console.log(targetKeys, direction, moveKeys)
      this.targetCompanyKeys = targetKeys
    },
    handleSearch_com (dir, value) {
      console.log('search:', dir, value)
    }
  }
}
</script>
