import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import type { Captcha } from "@/components/turnstile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { stepDescriptions, steps } from "./constants"
import type { FormValues } from "./schema"
import { BudgetStep } from "./steps/budget-step"
import { DietaryNeedsStep } from "./steps/dietary-needs-step"
import { HomeLocationStep } from "./steps/home-location-step"
import { ReviewStep } from "./steps/review-step"
import { TravelStylesStep } from "./steps/travel-styles-step"
import { TravelTypeStep } from "./steps/travel-type-step"
import { TripDetailsStep } from "./steps/trip-details-step"

interface WizardCardProps {
  form: UseFormReturn<FormValues>
  currentStep: number
  isSubmitting: boolean
  captcha: Captcha
  onBack: () => void
  onNext: () => void
}

function StepIcon({ index }: { index: number }) {
  const Icon = steps[index].icon
  return <Icon className="h-4 w-4" />
}

function StepContent({ form, currentStep, captcha }: { form: UseFormReturn<FormValues>; currentStep: number; captcha: Captcha }) {
  return (
    <>
      {currentStep === 0 && <TripDetailsStep form={form} />}
      {currentStep === 1 && <HomeLocationStep form={form} />}
      {currentStep === 2 && <TravelTypeStep form={form} />}
      {currentStep === 3 && <TravelStylesStep form={form} />}
      {currentStep === 4 && <DietaryNeedsStep form={form} />}
      {currentStep === 5 && <BudgetStep form={form} />}
      {currentStep === 6 && <ReviewStep form={form} captcha={captcha.widget} />}
    </>
  )
}

export function WizardCard({ form, currentStep, isSubmitting, captcha, onBack, onNext }: WizardCardProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <StepIcon index={currentStep} />
          </div>
          <div>
            <CardTitle className="text-2xl">{steps[currentStep].name}</CardTitle>
            <CardDescription>{stepDescriptions[currentStep]}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepContent form={form} currentStep={currentStep} captcha={captcha} />
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={currentStep === 0} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex w-full gap-2 sm:w-auto">
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={onNext} className="w-full sm:w-auto">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting || (captcha.enabled && !captcha.token)} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  Generate Itinerary <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
