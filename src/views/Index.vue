<script setup lang="ts">
import {nextTick, ref} from 'vue';
import SvgIcon from "@/components/SvgIcon.vue";
import {useSSE} from  "@/hooks/useSSE"


// 输入的消息
const message = ref('')

// textarea 引用
const textareaRef = ref(null);

const chatContainer = ref(null)


// 自动调整文本域高度
const autoResize = () => {
  const textarea = textareaRef.value;
  if (textarea) { // 若文本域存在
    textarea.style.height = 'auto'; // 1. 先将高度重置为 'auto'
    // 计算新高度，但最大不超过 300px
    const newHeight = Math.min(textarea.scrollHeight, 300);
    textarea.style.height = newHeight + 'px';

    // 如果内容超出 300px，则启用滚动
    textarea.style.overflowY = textarea.scrollHeight > 300 ? 'auto' : 'hidden';

  }
};

const messageList=ref([{
  role:"assistant",
  content: "我是DeepSeek Chat，由深度求索公司开发的智能AI助手！✨ 我可以帮你解答各种问题，无论是学习、工作，还是日常生活中的小困惑，都可以找我聊聊。有什么我可以帮你的吗？😊"
}])


// 滚动到底部
const scrollToBottom = async () => {
  await nextTick() // 等待 Vue.js 完成 DOM 更新
  if (chatContainer.value) { // 若容器存在
    // 将容器的滚动条位置设置到最底部
    const container = chatContainer.value;
    container.scrollTop = container.scrollHeight;
  }
}


const { connect, disconnect, isStreaming } = useSSE()


//发送消息
const sendMessage=async ()=>{

  scrollToBottom()
  //校验发送的消息不能为空
  if(!message.value.trim()) return
  //将用户的提问加入到聊天记录中
  const userMessage=message.value.trim()
  messageList.value.push({
    role: "user",
    content:userMessage
  })
  // 清空输入框并重置高度
  message.value = ''
  //输入框高度重置
  if(textareaRef.value)
    textareaRef.value.style.height = 'auto';

  //添加一个占位的回复消息
  messageList.value.push({
    role: "assistant",
    content: ""
  })
  try{
    await
        connect('http://localhost:8090/ai/generateStream?message='+userMessage,
            async (data) => {
          messageList.value[messageList.value.length-1].content+=data
              // 滚动到底部
          scrollToBottom()
    });

  }catch (error){
    console.log('发送消息错误',error)
     scrollToBottom()
    messageList.value[messageList.value.length-1].content="抱歉，出错了，请稍后重试"
  }



}

</script>

<template>
  <div class="h-screen max-w-3xl mx-auto   flex flex-col justify-between" >
<!--    聊天记录区域-->
    <div class="overflow-y-auto mb-4 mt-4 px-4 border-amber-800 border-1" ref="chatContainer">

      <template v-for="(chat,index) in messageList" :key="index">

        <!-- 用户提问消息（靠右） -->
        <div v-if="chat.role==='user'" class="flex justify-end mb-4">
          <div class="quesiton-container">
            <p>{{chat.content}}</p>
          </div>
        </div>

        <!-- 大模型回复消息（靠左） -->
        <div v-else  class="flex mb-4">
          <!-- 头像 -->
          <div class="flex-shrink-0 mr-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200">
              <SvgIcon name="deepseek" custom-css="w-6 h-6"></SvgIcon>
            </div>
          </div>
          <!-- 回复的内容 -->
          <div class="p-1 max-w-[80%] mb-2 grow">
            <p>{{chat.content}}</p>
          </div>
        </div>


      </template>


    </div>


<!--    输入提问框-->
    <div class="w-full  mb-1  ">
      <div class="bg-gray-100 rounded-3xl px-4 py-3 mx-4 border border-gray-200">
        <textarea
            v-model="message"
            placeholder="给小哈 AI 机器人发送消息"
            class="bg-transparent border-none outline-none w-full text-sm resize-none min-h-10"
            rows="2"
            @input="autoResize"
            @keydown.enter.prevent="sendMessage"
            ref="textareaRef"
        >
        </textarea>

        <!-- 发送按钮 -->
        <div class="flex justify-end">
          <button
              @click="sendMessage"
              :disabled="!message.trim()"
              class="flex items-center justify-center bg-[#4d6bfe] rounded-full w-8 h-8 border border-[#4d6bfe]
              hover:bg-[#3b5bef] transition-colors
              disabled:opacity-50
              disabled:cursor-not-allowed
           ">
            <SvgIcon name="uparrow" customCss="w-5 h-5 text-white"></SvgIcon>
          </button>
        </div>


      </div>
      <div class="flex items-center justify-center text-xs text-gray-400 mt-2">
        内容由 AI 生成，请仔细甄别
      </div>
    </div>
  </div>
</template>

<style scoped>
.quesiton-container {
  font-size: 16px;
  line-height: 28px;
  color: #262626;
  padding: calc((44px - 28px) / 2) 20px;
  box-sizing: border-box;
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #eff6ff;
  border-radius: 14px;
  max-width: calc(100% - 48px);
  position: relative;
}

/* 聊天内容区域样式 */
.overflow-y-auto {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
</style>


