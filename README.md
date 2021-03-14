### 对elementui中级联选择器的二次封装
```
npm install --save-dev cu-vue-cascader
```

#### 功能
- 二级级联选择器子节点懒加载，解决数据量过大导致页面渲染卡顿

#### 效果预览
![](./1.gif)

#### 参数传递(在el-cascader的基础上)
- allOptions: array 所有的参数
- selectAll:  boolean 默认是否全选
- allSelectedClass: {} 全选时候的样式
- lazy: boolean 是否开启子选项的懒加载
- loadSize: number 子选择每次加载的条数
- 其他参数均继承el-cascader