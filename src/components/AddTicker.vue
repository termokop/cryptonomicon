<template>
    <section>
      <div class="flex">
        <div class="max-w-xs">
          <label for="wallet" class="block text-sm font-medium text-gray-700"
            >Тикер</label
          >
          <div class="mt-1 relative rounded-md shadow-md">
            <input
              @keydown.enter="add"
              @input="changeInput"
              type="text"
              name="wallet"
              id="wallet"
              v-model="ticker"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Например DOGE"
            />
          </div>
          <div v-if="hints.length" class="flex bg-white shadow-md p-1 rounded-md flex-wrap">
            <span 
              v-for="hint in hints"
              :key="hint"
              @click="choose_hint(hint)"
              class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
              {{ hint }}
            </span>
          </div>
          <div v-if="isTickerExist" class="text-sm text-red-600">Такой тикер уже добавлен</div>
        </div>
      </div>
      <add-btn
        @click="add"
        type="button"
        class="my-4"
        :disabled="disabled"
      >
        Добавить
      </add-btn>
    </section>
</template>


<script>
import AddBtn from './AddBtn.vue';

export default {
    components: {
        AddBtn,
    },
    props: {
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        tickers: {
            type: Array,
            required:true
        },
        coin_list: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    emits: {
        'add-ticker': value => typeof value === "string"
    },
    data() {
        return{
            ticker: "",
            hints: [],
            isTickerExist: false,
            
        }
    },
    methods: {
        add() {
      const isExist = this.tickers.filter(el => el.name === this.ticker)
      if(isExist.length) {
        this.isTickerExist = true
        return
      }
      if(this.ticker && !this.disabled) {
        this.$emit("add-ticker", this.ticker)
        }
      


        this.ticker = ''
        this.hints = []
      },
      choose_hint(hint) {
      this.ticker = hint
      this.add()
    },
    
    changeInput() {
      this.isTickerExist = false
      this.hints = []
      this.ticker = this.ticker.toUpperCase()
      const max_hints_count = 4
      this.coin_list.map(el => {
        if(this.hints.length < max_hints_count) {
          if(el[1].FullName.toUpperCase().includes(this.ticker)) {
            this.hints.push(el[1].Symbol)
          }
        }
      })
      if(this.ticker === '') this.hints = []
    },
    },
    created() {

    }

}

</script>