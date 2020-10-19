<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="角色名称">
                <a-input v-model="queryParam.roleNameZh" placeholder="请输入"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="使用状态">
                <a-select v-model="queryParam.enabled" placeholder="请选择" default-value="true">
                  <a-select-option value="true">可用</a-select-option>
                  <a-select-option value="false">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
            <!-- lock | unlock -->
            <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <L-table
        ref="table"
        :columns="columns"
        :data="loadData"
        size="default"
        rowKey="id"
        :alert="true"
        :rowSelection="rowSelection"
        showPagination="auto">
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="enabled" slot-scope="text, record">
          <template>
            <a-tag color="#87d068" v-if="record">
              使用中
            </a-tag>
            <a-tag color="#f50" v-else>
              禁用
            </a-tag>
          </template>
        </span>

        <span slot="status" slot-scope="text">
          {{ text | statusFilter }}
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleGrantUser(record)">成员列表</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleGrantPermission(record)">权限列表</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;">删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </L-table>
      <create-form
        ref="createModal"
        :visible="addVisible"
        :loading="confirmLoading"
        :model="addMdl"
        @cancel="handleAddCancel"
        @ok="handleAddOk"
      />
      <role-Modal
        ref="grantModal"
        :visible="grantVisible"
        :loading="grantConfirmLoading"
        :model="grantMdl"
        @cancel="handleGrantCancel"
        @ok="handleGrantOk"
      />
      <permission-Modal
        ref="permissionModal"
        :visible="permissionVisible"
        :loading="permissionConfirmLoading"
        :model="permissionMdl"
        @cancel="handlePermissionCancel"
        @ok="handlePermissionOk"
      />
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { LTable } from '@/components'

import { getRoleList, grantPermissions, grantUsers, saveRole } from '@/api/lanson'
import CreateForm from './modules/CreateForm'
import RoleModal from './modules/RoleModal'
import PermissionModal from './modules/PermissionModal'
export default {
  name: 'TableList',
  components: {
    LTable,
    CreateForm,
    RoleModal,
    PermissionModal
  },
  data () {
    return {
      addVisible: false,
      grantVisible: false,
      permissionVisible: false,
      confirmLoading: false,
      grantConfirmLoading: false,
      permissionConfirmLoading: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      form: null,
      grantMdl: {},
      addMdl: {},
      permissionMdl: {},
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '序号',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '唯一识别码',
          dataIndex: 'id'
        },
        {
          title: '角色英文代号',
          dataIndex: 'roleNameEn'
        },
        {
          title: '角色名称',
          dataIndex: 'roleNameZh'
        },
        {
          title: '角色描述',
          dataIndex: 'roleDesc'
        },
        {
          title: '是否是超级权限',
          dataIndex: 'enabled',
          scopedSlots: { customRender: 'enabled' }
        },
        {
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 向后端拉取可以用的操作列表
      permissionList: null,
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        return getRoleList(requestParameters)
          .then(res => {
            console.log('res:' + res)
            return res
          })
      },

      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (status) {
      const statusMap = {
        1: '正常',
        2: '禁用'
      }
      return statusMap[status]
    }
  },
  created () {
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleAdd () {
      this.addMdl = null
      this.addVisible = true
    },
    handleEdit (record) {
      this.mdl = Object.assign({}, record)
      console.log(this.mdl)
      this.visible = true
    },
    handleGrantUser (record) {
      this.grantMdl = Object.assign({}, record)
      this.grantVisible = true
    },
    handleGrantPermission (record) {
      this.permissionMdl = Object.assign({}, record)
      this.permissionVisible = true
    },
    handleOk () {

    },
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    handleAddCancel () {
      this.addVisible = false

      // const form = this.$refs.createModal.form
      // form.resetFields() // 清理表单数据（可不做）
    },
    handleGrantCancel () {
      this.grantVisible = false
      const form = this.$refs.grantModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleGrantOk () {
      const form = this.$refs.grantModal.form
      const targetKeys = this.$refs.grantModal.targetKeys
      console.log('targetKeys')
      console.log(targetKeys)
      this.grantConfirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id > 0) {
            // var custCodeIds = []
            // targetKeys.forEach(function (value, key) {
            //   console.log(value)
            //   custCodeIds.push({ id: parseInt(value) })
            //   // custCodeIds = Object.assign(custCodeIds, { id: parseInt(value) })
            // })
            const newValues = Object.assign({}, values, { userIds: targetKeys.join(',') })
            console.log('newValues', newValues)
            grantUsers(newValues).then(res => {
              // 修改 e.g.
              this.grantVisible = false
              this.grantConfirmLoading = false
              this.$refs.table.refresh()
              this.$message.info('修改成功')
            }).finally(
              this.confirmLoading = false
            )
          } else {
            this.confirmLoading = false
            this.$message.info('修改失败')
          }
        } else {
          this.grantConfirmLoading = false
        }
      })
    },
    handleAddOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.addVisible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            saveRole(values)
              .then(res => {
                console.log('save:')
                console.log(res)
                if (res && res === 'ok') {
                  this.addVisible = false
                  // 重置表单数据
                  // form.resetFields()
                  // 刷新表格
                  this.$refs.table.refresh()

                  this.$message.info('新增成功')
                } else {
                  this.$message.info('新增失败')
                }
              }).finally(
              this.confirmLoading = false
            )// 新增
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handlePermissionCancel () {
      this.permissionVisible = false
      const form = this.$refs.permissionModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handlePermissionOk () {
      const form = this.$refs.permissionModal.form
      const targetKeys = this.$refs.permissionModal.targetKeys
      this.permissionConfirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id > 0) {
            // var custCodeIds = []
            // targetKeys.forEach(function (value, key) {
            //   console.log(value)
            //   custCodeIds.push({ id: parseInt(value) })
            //   // custCodeIds = Object.assign(custCodeIds, { id: parseInt(value) })
            // })
            const newValues = Object.assign({}, values, { authIds: targetKeys.join(',') })
            grantPermissions(newValues).then(res => {
              // 修改 e.g.
              this.permissionVisible = false
              this.permissionConfirmLoading = false
              this.$refs.table.refresh()
              this.$message.info('修改成功')
            }).finally(
              this.permissionConfirmLoading = false
            )
          } else {
            this.permissionConfirmLoading = false
            this.$message.info('修改失败')
          }
        } else {
          this.permissionConfirmLoading = false
        }
      })
    }
  },
  watch: {
    /*
      'selectedRows': function (selectedRows) {
        this.needTotalList = this.needTotalList.map(item => {
          return {
            ...item,
            total: selectedRows.reduce( (sum, val) => {
              return sum + val[item.dataIndex]
            }, 0)
          }
        })
      }
      */
  }
}
</script>
