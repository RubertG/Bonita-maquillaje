"use client"

import { useEffect, useState } from "react"

export const useAutoHide = (time: number) => {
	const [show, setShow] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => setShow(false), time)

		return () => clearTimeout(timer)
	}, [time])

	return { show }
}
