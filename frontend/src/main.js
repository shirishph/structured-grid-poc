import Vue from 'vue'
import DraftingTable from './DraftingTable.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(DraftingTable),
}).$mount('#app')
