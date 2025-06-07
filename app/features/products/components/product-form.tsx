import { Form } from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

interface ProductFormProps {
  defaultValues?: {
    name: string;
  };
  isSubmitting: boolean;
  errors?: {
    name?: string[];
  };
  error?: string;
}

export function ProductForm({ defaultValues, isSubmitting, errors, error }: ProductFormProps) {
  return (
    <Form method="post" className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter product name"
          disabled={isSubmitting}
          defaultValue={defaultValues?.name}
        />
        {errors?.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Product"}
      </Button>
    </Form>
  );
}
