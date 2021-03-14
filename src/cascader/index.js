import Vue from 'vue'
import CuElCascader from './index.vue'

CuElCascader.install = function(Vue) {
  Vue.component(CuElCascader.name, CuElCascader);
};

export default CuElCascader;
