import React, { useState, useEffect } from "react";
import { MinusCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface QuestionFormData {
  id?: number;
  title: string;
  description: string;
  type: "single_correct" | "multi_correct";
  points: number;
  options: Option[];
}

interface QuestionFormProps {
  questionData?: any;
  onSave: (questionData: any) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  questionData,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    title: "",
    description: "",
    type: "single_correct",
    points: 1,
    options: [],
  });

  useEffect(() => {
    if (questionData) {
      setFormData({
        id: questionData.id,
        title: questionData.title || "",
        description: questionData.description || "",
        type: questionData.type || "single_correct",
        points: questionData.points || 1,
        options: questionData.options || [],
      });
    }
  }, [questionData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleTypeChange = (value: "single_correct" | "multi_correct") => {
    setFormData({ ...formData, type: value });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, field: keyof Option, value: any) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h4 className="text-xl font-semibold text-foreground">
        {questionData ? "Edit Question" : "Add New Question"}
      </h4>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-foreground">
          Question *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="bg-background text-foreground border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="bg-background text-foreground border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type" className="text-foreground">
          Question Type *
        </Label>
        <Select value={formData.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_correct">Single Correct Answer</SelectItem>
            <SelectItem value="multi_correct">Multiple Correct Answers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="points" className="text-foreground">
          Points *
        </Label>
        <Input
          id="points"
          type="number"
          min={1}
          value={formData.points}
          onChange={(e) =>
            setFormData({ ...formData, points: parseInt(e.target.value) || 1 })
          }
          required
          className="bg-background text-foreground border-border"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-foreground">Options</Label>
        <AnimatePresence>
          {formData.options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-muted/50 rounded-lg p-4 mb-4 border border-border"
            >
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Option text"
                    value={option.text}
                    onChange={(e) => updateOption(index, "text", e.target.value)}
                    required
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={option.isCorrect}
                    onCheckedChange={(checked) =>
                      updateOption(index, "isCorrect", checked)
                    }
                    disabled={
                      formData.type === "single_correct" &&
                      formData.options.some(
                        (opt, i) => i !== index && opt.isCorrect
                      )
                    }
                  />
                  <Label className="text-sm text-foreground">
                    {option.isCorrect ? "Correct" : "Incorrect"}
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Save Question</Button>
        {onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete Question
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
