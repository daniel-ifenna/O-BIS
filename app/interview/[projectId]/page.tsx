"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChevronLeft, Video } from "lucide-react"

export default function InterviewRoom() {
  const { projectId } = useParams() as { projectId: string }
  const roomId = projectId
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        await localVideoRef.current.play()
      }
      setIsActive(true)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview Room</h1>
            <p className="text-sm text-muted-foreground">Project {roomId}</p>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>Video Interview</CardTitle>
            <CardDescription>Connect managers and contractors for the next-stage interview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button className="bg-primary hover:bg-primary/90" onClick={startLocalStream} disabled={isActive}>
                  <Video className="w-4 h-4 mr-2" />
                  {isActive ? "Call Active" : "Start Call"}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Local Preview</p>
                  <video ref={localVideoRef} className="w-full aspect-video rounded-lg bg-black" muted playsInline />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Remote Participant</p>
                  <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    Waiting for participant...
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">This preview provides a meeting room entry point.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
