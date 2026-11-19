import { Input, Label, Select } from "@/components/ui/Input";
import type { Subject } from "@/models/subject";

/** Campos de una franja (materia, fecha, inicio y fin). Se usan al crear y al editar. */
export function SlotFields({
  idPrefix,
  subjects,
  minDate,
  maxDate,
  defaults,
}: {
  idPrefix: string;
  subjects: Pick<Subject, "id" | "name">[];
  minDate: string;
  maxDate: string;
  defaults?: { subjectId: string; date: string; startTime: string; endTime: string };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-subject`}>Materia</Label>
        <Select
          id={`${idPrefix}-subject`}
          name="subjectId"
          required
          defaultValue={defaults?.subjectId ?? (subjects.length === 1 ? subjects[0].id : "")}
        >
          <option value="" disabled>
            Selecciona una materia…
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-date`}>Fecha</Label>
        <Input
          id={`${idPrefix}-date`}
          name="date"
          type="date"
          required
          min={minDate}
          max={maxDate}
          defaultValue={defaults?.date}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-start`}>Hora de inicio</Label>
        <Input
          id={`${idPrefix}-start`}
          name="startTime"
          type="time"
          required
          step={900}
          defaultValue={defaults?.startTime}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-end`}>Hora de finalización</Label>
        <Input
          id={`${idPrefix}-end`}
          name="endTime"
          type="time"
          required
          step={900}
          defaultValue={defaults?.endTime}
        />
      </div>
    </div>
  );
}
