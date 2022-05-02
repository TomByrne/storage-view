import React from "react"
import { RefObject, useState } from "react"

export default function useRefDimensions(ref: RefObject<HTMLElement>) {
    const [dimensions, setDimensions] = useState({ width: 1, height: 2 })
    React.useEffect(() => {
        if (ref.current) {
            const boundingRect = ref.current.getBoundingClientRect()
            const { width, height } = boundingRect
            setDimensions({ width: Math.round(width), height: Math.round(height) })
        }
    }, [ref])
    return dimensions
}