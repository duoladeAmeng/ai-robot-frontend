import { ref, onBeforeUnmount } from 'vue'

export const useSSE = () => {
    let eventSource = null
    const isStreaming = ref(false)

    const connect = (url, onMessage, onError) => {
        return new Promise((resolve, reject) => {
            if (eventSource) {
                eventSource.close()
            }

            isStreaming.value = true
            eventSource = new EventSource(url)

            eventSource.onmessage = (event) => {
                onMessage(event.data)
            }

            eventSource.onerror = (error) => {
                if (eventSource.readyState === EventSource.CLOSED) {
                    isStreaming.value = false
                    resolve()
                } else {
                    isStreaming.value = false
                    onError?.(error)
                    reject(error)
                }
                eventSource.close()
                eventSource = null
            }

            eventSource.onopen = () => {
                resolve()
            }
        })
    }

    const disconnect = () => {
        if (eventSource) {
            eventSource.close()
            eventSource = null
            isStreaming.value = false
        }
    }

    onBeforeUnmount(() => {
        disconnect()
    })

    return {
        connect,
        disconnect,
        isStreaming
    }
}