"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import type { ClaimFeatures } from "@/types/claim-types"
import { ICD_CODES, CPT_CODES, PAYERS, MODIFIERS } from "@/types/claim-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader2, Send } from "lucide-react"

interface ClaimAnalyzerFormProps {
  onSubmit: (data: ClaimFeatures) => void
  isLoading?: boolean
}

export function ClaimAnalyzerForm({ onSubmit, isLoading = false }: ClaimAnalyzerFormProps) {
  const [docQuality, setDocQuality] = useState(0.8)
  const [priorAuth, setPriorAuth] = useState(true)

  const { register, handleSubmit, setValue, watch } = useForm<ClaimFeatures>({
    defaultValues: {
      payer: "Medicare",
      patient_age: 45,
      ICD_10_code: "J01.90",
      CPT_code: "99213",
      modifier: "None",
      documentation_quality_score: 0.8,
      prior_auth_obtained: 1,
      billed_amount: 150,
      submission_days_delay: 3,
      past_denial_count: 0,
    },
  })

  const handleFormSubmit = (data: ClaimFeatures) => {
    onSubmit({
      ...data,
      documentation_quality_score: docQuality,
      prior_auth_obtained: priorAuth ? 1 : 0,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payer */}
        <div className="space-y-2">
          <Label htmlFor="payer">Insurance Payer</Label>
          <Select
            defaultValue="Medicare"
            onValueChange={(value) => setValue("payer", value)}
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select payer" />
            </SelectTrigger>
            <SelectContent>
              {PAYERS.map((payer) => (
                <SelectItem key={payer} value={payer}>
                  {payer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Patient Age */}
        <div className="space-y-2">
          <Label htmlFor="patient_age">Patient Age</Label>
          <Input
            id="patient_age"
            type="number"
            min={0}
            max={120}
            className="bg-secondary"
            {...register("patient_age", { valueAsNumber: true })}
          />
        </div>

        {/* ICD-10 Code */}
        <div className="space-y-2">
          <Label htmlFor="ICD_10_code">ICD-10 Diagnosis Code</Label>
          <Select
            defaultValue="J01.90"
            onValueChange={(value) => setValue("ICD_10_code", value)}
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select diagnosis" />
            </SelectTrigger>
            <SelectContent>
              {ICD_CODES.map((icd) => (
                <SelectItem key={icd.code} value={icd.code}>
                  <span className="font-mono">{icd.code}</span>
                  <span className="ml-2 text-muted-foreground text-xs">{icd.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CPT Code */}
        <div className="space-y-2">
          <Label htmlFor="CPT_code">CPT Procedure Code</Label>
          <Select
            defaultValue="99213"
            onValueChange={(value) => setValue("CPT_code", value)}
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select procedure" />
            </SelectTrigger>
            <SelectContent>
              {CPT_CODES.map((cpt) => (
                <SelectItem key={cpt.code} value={cpt.code}>
                  <span className="font-mono">{cpt.code}</span>
                  <span className="ml-2 text-muted-foreground text-xs">{cpt.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modifier */}
        <div className="space-y-2">
          <Label htmlFor="modifier">Modifier</Label>
          <Select
            defaultValue="None"
            onValueChange={(value) => setValue("modifier", value)}
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select modifier" />
            </SelectTrigger>
            <SelectContent>
              {MODIFIERS.map((mod) => (
                <SelectItem key={mod} value={mod}>
                  {mod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Billed Amount */}
        <div className="space-y-2">
          <Label htmlFor="billed_amount">Billed Amount ($)</Label>
          <Input
            id="billed_amount"
            type="number"
            min={0}
            step={0.01}
            className="bg-secondary"
            {...register("billed_amount", { valueAsNumber: true })}
          />
        </div>

        {/* Submission Days Delay */}
        <div className="space-y-2">
          <Label htmlFor="submission_days_delay">Submission Delay (days)</Label>
          <Input
            id="submission_days_delay"
            type="number"
            min={0}
            className="bg-secondary"
            {...register("submission_days_delay", { valueAsNumber: true })}
          />
        </div>

        {/* Past Denial Count */}
        <div className="space-y-2">
          <Label htmlFor="past_denial_count">Past Denial Count</Label>
          <Input
            id="past_denial_count"
            type="number"
            min={0}
            className="bg-secondary"
            {...register("past_denial_count", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Documentation Quality Score */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Documentation Quality Score</Label>
          <span className="font-mono text-sm text-muted-foreground">
            {(docQuality * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          value={[docQuality * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setDocQuality(value[0] / 100)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Poor</span>
          <span>Average</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Prior Auth Obtained */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
        <div>
          <Label htmlFor="prior_auth" className="text-base">
            Prior Authorization Obtained
          </Label>
          <p className="text-sm text-muted-foreground">
            Required for complex procedures (99215)
          </p>
        </div>
        <Switch
          id="prior_auth"
          checked={priorAuth}
          onCheckedChange={setPriorAuth}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing Claim...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Analyze Claim
          </>
        )}
      </Button>
    </form>
  )
}
