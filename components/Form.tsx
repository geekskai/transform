/**
 * Modal form — DESIGN-SPEC §3.2 Card, §3.5 Primary / §3.6 Secondary buttons,
 * §3.4 Badge (section), §3.10 Feature card (group), typography §5.
 */
import React, { useMemo } from "react";
import { Formik, FormikProps } from "formik";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export enum InputType {
  SWITCH = 1,
  TEXT_INPUT,
  SELECT
}

export interface FormField<T = object> {
  key: string;
  type: InputType;
  label: string;
  section?: string;
  isDisabled?: (values: T) => boolean;
  props?: any;
  options?: { label: string; value: string | number }[];
}

interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  title: string;
  formsFields: FormField<T>[];
  open: boolean;
  toggle: () => void;
}

const SECTION_ORDER = [
  "Optimize",
  "Remove",
  "Convert",
  "Cleanup",
  "Move",
  "Collapse",
  "Merge",
  "Sort",
  "Other"
];

function getSectionFromLabel(label: string): string {
  const first = label.split(/\s+/)[0] ?? "";
  const cap = first.charAt(0).toUpperCase() + first.slice(1);
  return SECTION_ORDER.includes(cap) ? cap : "Other";
}

function useGroupedFields<T>(fields: FormField<T>[]) {
  return useMemo(() => {
    const hasExplicitSection = fields.some(f => f.section != null);
    const mostlySwitches =
      fields.length >= 6 &&
      fields.filter(f => f.type === InputType.SWITCH).length >=
        fields.length * 0.8;

    if (hasExplicitSection) {
      const map = new Map<string, FormField<T>[]>();
      for (const f of fields) {
        const section = f.section ?? "Other";
        if (!map.has(section)) map.set(section, []);
        map.get(section)!.push(f);
      }
      return Array.from(map.entries()).map(([section, list]) => ({
        section,
        fields: list
      }));
    }

    if (mostlySwitches) {
      const map = new Map<string, FormField<T>[]>();
      for (const f of fields) {
        const section = getSectionFromLabel(f.label);
        if (!map.has(section)) map.set(section, []);
        map.get(section)!.push(f);
      }
      const ordered = SECTION_ORDER.filter(s => map.has(s));
      return ordered.map(section => ({
        section,
        fields: map.get(section)!
      }));
    }

    return [{ section: null as string | null, fields }];
  }, [fields]);
}

function FormRow<T extends object>({
  field,
  formikProps,
  compact
}: {
  field: FormField<T>;
  formikProps: FormikProps<T>;
  compact?: boolean;
}) {
  const { type, key, label, isDisabled, props: _props, options } = field;
  const _isDisabled = isDisabled ? isDisabled(formikProps.values) : undefined;

  if (type === InputType.TEXT_INPUT || type === InputType.SELECT) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2",
          type === InputType.SELECT && "flex-col items-stretch"
        )}
        {..._props}
      >
        <Label
          htmlFor={key}
          className={cn(
            "text-sm font-medium leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            _isDisabled ? "opacity-40" : ""
          )}
        >
          {label}
        </Label>
        {type === InputType.TEXT_INPUT && (
          <Input
            id={key}
            value={(formikProps.values as any)[key]}
            onChange={formikProps.handleChange}
            name={key}
            disabled={_isDisabled}
            className="w-full rounded-2xl border-[var(--brand-200)] bg-[var(--brand-50)]/50 text-gray-900 placeholder:text-gray-500 focus:border-[var(--brand-400)] focus:ring-4 focus:ring-[var(--brand-400)]/20"
          />
        )}
        {type === InputType.SELECT && options && (
          <Select
            value={(formikProps.values as any)[key]}
            onValueChange={v => formikProps.setFieldValue(key, v)}
            disabled={_isDisabled}
          >
            <SelectTrigger className="w-full rounded-2xl border-[var(--brand-200)] bg-[var(--brand-50)]/50 focus:ring-[var(--brand-400)]/20">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  return (
    <div
      key={key}
      className={cn(
        "flex items-center justify-between gap-4",
        compact ? "py-1.5" : "py-2"
      )}
      {..._props}
    >
      <Label
        htmlFor={key}
        className={cn(
          "flex-1 cursor-pointer text-sm font-medium leading-snug text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          _isDisabled ? "opacity-40" : ""
        )}
      >
        {label}
      </Label>
      <Switch
        id={key}
        checked={(formikProps.values as any)[key]}
        onCheckedChange={checked => formikProps.setFieldValue(key, checked)}
        disabled={_isDisabled}
      />
    </div>
  );
}

const Form = <T extends object>({
  initialValues,
  onSubmit,
  title,
  formsFields,
  open,
  toggle
}: FormProps<T> & { children?: React.ReactNode }) => {
  const grouped = useGroupedFields(formsFields);
  const isLongForm = grouped.length > 1;

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        onSubmit(values);
        toggle();
      }}
    >
      {(props: FormikProps<T>) => (
        <Dialog open={open} onOpenChange={toggle}>
          <DialogContent
            className={cn(
              "flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-3xl border border-gray-200 bg-white p-0 shadow-xl shadow-[#16F2B3]/10 sm:max-w-[425px]",
              isLongForm && "sm:max-w-2xl"
            )}
          >
            <DialogHeader className="shrink-0 border-b border-gray-200 px-6 py-4 md:px-8 md:py-5">
              <DialogTitle className="text-lg font-bold text-gray-900 md:text-xl">
                {title}
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 md:px-7 md:py-5">
              {grouped.map(({ section, fields }) => (
                <div
                  key={section ?? "default"}
                  className={cn(isLongForm ? "mb-5 last:mb-0" : "space-y-4")}
                >
                  {section != null && (
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--brand-300)] bg-gradient-to-r from-[var(--brand-100)] to-[var(--brand-50)] px-4 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-800)] md:text-sm">
                        {section}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      section != null &&
                        "rounded-2xl border border-gray-200 bg-gradient-to-br from-[var(--brand-50)]/80 via-white to-[var(--brand-50)]/50 p-4 transition-all duration-300 hover:border-[var(--brand-300)] hover:shadow-lg hover:shadow-[#16F2B3]/15 md:p-4"
                    )}
                  >
                    {fields.map(field => (
                      <FormRow
                        key={field.key}
                        field={field}
                        formikProps={props}
                        compact={isLongForm && section != null}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="shrink-0 gap-3 border-t border-gray-200 px-6 py-4 md:px-8 md:py-5">
              <Button
                variant="outline"
                className="rounded-2xl border-[var(--brand-300)] bg-gradient-to-br from-[var(--brand-50)] to-[var(--brand-100)]/50 px-6 py-4 font-semibold text-[var(--brand-800)] transition-all duration-300 hover:border-[var(--brand-400)] hover:shadow-lg hover:shadow-[#16F2B3]/20"
                onClick={() => {
                  props.resetForm();
                  toggle();
                }}
              >
                Cancel
              </Button>
              <Button
                className="rounded-2xl bg-gradient-to-r from-[#16F2B3] via-[#1AE8B0] to-[#16F2B3] px-8 py-4 text-lg font-bold text-gray-900 shadow-lg shadow-[#16F2B3]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#16F2B3]/30"
                onClick={() => props.submitForm()}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Formik>
  );
};

export default Form;
