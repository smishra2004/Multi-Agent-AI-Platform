import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setMessages } from '../redux/messageSlice'
import MessageBubble from './MessageBubble'
import LoadingAnimation from './LoadingAnimation'
import { useRef } from 'react'

function MessageList() {
  
  const {selectedConversation} = useSelector(state=>state.conversation)
  const {messages,isLoading} = useSelector(state=>state.message)

  const bottomRef = useRef(null)

  useEffect(()=>{
    requestAnimationFrame(()=>{
        bottomRef.current.scrollIntoView({
            behavior:"smooth",
            block:"end"
        })
    })
  },[messages?.length,isLoading])

  const dispatch = useDispatch()

//   useEffect(() => {
//       const loadMessages = async () => {
//           if (!selectedConversation?._id) {
//               dispatch(setMessages([]))
//               return
//           }

//           const data = await getMessages(selectedConversation._id)
//           dispatch(setMessages(data))
//       }

//       loadMessages()
//   }, [selectedConversation?._id])

useEffect(() => {
  let cancelled = false

  const loadMessages = async () => {
    if (!selectedConversation?._id) {
      dispatch(setMessages([]))
      return
    }

    // Don't fetch an empty conversation while its first message is being sent.
    if (selectedConversation.title === "New Chat") return

    try {
      const data = await getMessages(selectedConversation._id)

      // Ignore a stale response after switching conversations.
      if (!cancelled) {
        dispatch(setMessages(data || []))
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  loadMessages()

  return () => {
    cancelled = true
  }
}, [
  selectedConversation?._id,
  selectedConversation?.title,
  dispatch
])

  return (
    <div className='flex-1 overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      {messages.length==0 || !selectedConversation ? 
      (<div className='h-full flex flex-col items-center justify-center gap-4 text-center'>
        <div className='flex flex-col gap-1.5'>
            <h1 className='text-[20px] font-semibold text-slate-200 tracking-light'>Syntra AI</h1>
            <p className='text-[15px] font-semibold text-slate-400 tracking-light'>How can I help you?</p>
            <p className='text-[13px] font-semibold text-slate-600 leading-relaxed'>
                Ask me anything - code, ideas, explanations or just a quick question
            </p>
        </div>
        <div className='flex flex-wrap justify-center gap-2 mt-1'>
            {["Write a Netflix clone","Explain Redis","Build a dashboard"].map((s)=>(
                <button className='text-[12px] text-slate-400 bg-white/[0.04] border border-white/[0.07]
                px-3 py-1.5 rounded-lg hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-150
                cursor-pointer'>
                    {s}
                </button>
            ))}
        </div>
      </div>) 
      : 
      <div className='space-y-5'>
        {messages?.map((msg,i)=>(
            <div>
                <MessageBubble role={msg?.role} content={msg?.content} images={msg.images || []}/>
            </div>
        ))}
        {isLoading && <LoadingAnimation/> }
        
      </div>}
      <div ref={bottomRef}/>
    </div>
  )
}

export default MessageList
