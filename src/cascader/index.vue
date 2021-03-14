<template>
  <div class="cu-cascader">
    <el-cascader
      id="el-cascader-cu"
      ref="elCascaderCu"
      :options="options"
      :props="props"
      v-model="values"
      :filterable="filterable"
      :clearable="clearable"
      :show-all-levels="showAllLevels"
      :collapse-tags="collapseTags"
      :before-filter="beforeFilter"
      :popper-class="popperClass"
      :filter-method="filterMethod"
      :separator="separator"
      :debounce="debounce"
      :size="size"
      :placeholder="placeholder"
      @expand-change="handleChange"
      >
    </el-cascader>
    <div class="allChecked" :style="allSelectedClass" v-if="isAllSelected">全部身份</div>
  </div>
</template>

<script>

  function debounce(fn, timer) {
    let ts = null
    return function() {
      clearTimeout(ts)
      ts = setTimeout(() => {
        fn()
      }, timer)
    }
  }

  export default {
    name: 'CuVueCascader',
    data() {
      return {
        values: [],
        options: [], // 当前列表的选项
        type: '',
        parents: [],
        isAllSelected: false
      };
    },

    watch: {
      'values': function(val) {
        this.isAllSelected = false
        if (val.length) {
          let tmpLen = 0
          this.options.forEach(ele=>{
            tmpLen += ele.children ? ele.children.length : 1 // 等于1的意思是如果没有叶子节点，则该节点视为叶子节点
          })

          if (tmpLen === val.length) {
            this.isAllSelected = true
          }
        }

        const tags = []
        const types = []
        val.forEach(ele=> {
          if (!types.includes(ele[0])) {
            types.push(ele[0])
          }

          if (ele.length === 1) {
            tags.push(ele[0])
          } else {
            tags.push(ele[1])
          }
        })

        this.$emit('change', {
          types,
          tags,
          isAllSelected: this.isAllSelected
        })
      }
    },

    props: {
      value: {
        type: Array,
        default: () => {}
      },
      allOptions: {
        type: Array,
        default: () => {}
      },
      // 懒加载时候每次加载的个数，需配合属性lazy一块使用
      loadSize: {
        type: Number,
        default: 10
      },
      selectAll: {
        type: Boolean,
        default: false
      },
      props: {},
      showAllLevels: {
        type: Boolean,
        default: true
      },
      placeholder: {
        type: String
      },
      disabled: Boolean,
      clearable: Boolean,
      filterable: Boolean,
      collapseTags: Boolean,
      popperClass: String,
      size: String,
      separator: String,
      allSelectedClass: {},
      filterMethod: Function,
      change: Function,
      debounce: Number,
      lazy: {
        type: Boolean,
        default: false
      }
    },
    created() {
      this.isAllSelected = this.selectAll
      this.getParent()
      this.seachTag()
    },

    mounted() {
      this.watchInput()
    },

    beforeDestroy() {

    },

    methods: {
      scrollCallback(el) {
        return () => {
          const scrollTop = el.scrollTop
          const clientHeight = el.clientHeight
          const scrollHeight = el.scrollHeight

          // 若scrollTop + clientHeight === scrollHeight 则说明滚动条到达了底部
          if (scrollTop + clientHeight === scrollHeight) {
            const tmp = []
            // 当前类型下所有的选项
            const allOptions = this.allOptions.filter(options=>options.value === this.type)[0]?.children
            
            this.options.forEach(element => {
              if (element.value === this.type) {

                const optionLen = element.children.length-1
                const allOptionsLen = allOptions.length-1

                if (optionLen >= allOptionsLen) {
                  return
                }

                const loadsize = optionLen + this.loadSize

                const size = loadsize > allOptionsLen ? allOptionsLen : loadsize
                for (var i=optionLen; i<=size; i++) {
                  tmp.push(allOptions[i])
                  if (this.isAllSelected) {
                    this.values.push([this.type, allOptions[i].value])
                  }
                }
                element.children.push(...tmp)
              }
            })
            
            setTimeout(() => {
              el.scrollTop = scrollTop
            })
          }
        }
      },

      beforeFilter() {
        if (this.lazy) {
          return false
        }
      },

      watchInput() {
        const dom = document.getElementById('el-cascader-cu')
        const input = dom.querySelector('.el-cascader__search-input')

        this.handleChange([this.parents[0]])

        const search = () => {
          const value = input.value
          this.seachTag(value)
        }

        if (this.lazy) {
          input.addEventListener('input', debounce(search, 400))
        }
      },

      handleChange(value) {
        if (!this.lazy) {
          return
        }
        this.$nextTick(() => {
          const panel = document.querySelectorAll('.el-cascader-menu__wrap.el-scrollbar__wrap')
          const length = panel.length
          const currentPanel = panel[length-1]
          this.type = value[0]

          if (currentPanel) {
            currentPanel.addEventListener('scroll', this.scrollCallback(currentPanel))
          }
        })
      },

      getParent() {
        this.allOptions.forEach(options => {
          this.parents.push(options.value)
        })
      },

      // 分页查询三种类型的标签,如果value有值则按值搜索，如果没值则取前二十条
      seachTag(value = '') {
        if (!this.lazy) {
          this.options = this.allOptions
          return 
        }

        let result = []
        this.allOptions.forEach((option, index) => {
          if (!value) {
            result.push({
              value: option.value,
              label: option.label,
              children: []
            })
            if (this.isAllSelected && !option.children) {
              this.values.push([option.value])
            }
          } else {
            this.$refs.elCascaderCu.$children[1].activePath = []
          }

          const children = option.children
          if (children) {
            children.forEach((ele, idx) => {
              if (!value) {
                if (idx < 20) {
                  result[index].children.push(ele)
                  if (this.isAllSelected) {
                    this.values.push([option.value, ele.value])
                  }
                }
              } else {
                if (ele.label.includes(value)) {
                  result.push(ele)
                }
              }
            })
          } else {
            if (result[index]) {
              delete result[index].children
            }
          }
        })
        this.options = result
      }
    }
  };
</script>
<style lang="scss" scoped>
.cu-cascader {
  height: 30px;
  position: relative;
  ::v-deep .el-cascader {
    position: absolute;
    top: 0;
    left: 0;
  }
  ::v-deep .el-cascader__tags {
    overflow: hidden;
    height: 30px;
    flex-wrap: nowrap;
  }
  ::v-deep .el-input--suffix {
    height: 30px;
    .el-input__icon {
      line-height: 32px;
    }
  }
  .allChecked {
    border-radius: 2px;
    position: absolute;
    left: 5px;
    top: 8px;
    width: 150px;
    text-align: center;
  }
}
</style>