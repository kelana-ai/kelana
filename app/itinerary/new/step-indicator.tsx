import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { steps } from "./constants"

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <>
      <div className="mb-10 hidden md:block">
        <div className="relative mb-6 flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200",
                  currentStep === index
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : currentStep > index
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {currentStep > index ? <Check className="h-6 w-6" /> : <step.icon className="h-5 w-5" />}
                <AnimatePresence>
                  {currentStep === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -inset-1 rounded-full border-2 border-primary"
                    />
                  )}
                </AnimatePresence>
              </div>
              <p className={cn("mt-2 text-xs font-medium", currentStep === index ? "text-primary" : "text-muted-foreground")}>
                {step.name}
              </p>
            </div>
          ))}
          <div className="absolute left-1/2 -translate-x-1/2 top-6 h-0.5 w-[85%] -translate-y-1/2">
            <div className="h-full w-full bg-muted" />
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between md:hidden">
        <p className="text-sm font-medium">
          Step {currentStep + 1} of {steps.length}
        </p>
        <p className="text-sm font-medium">{steps[currentStep].name}</p>
      </div>
    </>
  )
}
