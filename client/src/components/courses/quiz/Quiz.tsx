import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "../../../store/quiz/type";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";
import QuestionForm from "./QuestionForm";

interface QuizFormData {
  title: string;
  description: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  duration: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  questions: Question[];
}

const Quiz: React.FC = () => {
  const { toast } = useToast();
  const [localQuiz, setLocalQuiz] = useState<QuizFormData>({
    title: "",
    description: "",
    startTime: undefined,
    endTime: undefined,
    duration: 0,
    shuffleQuestions: false,
    showResults: false,
    questions: [],
  });
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddQuestion = (questionData: any) => {
    setLocalQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...questionData, id: Date.now() }],
    }));
    toast({
      title: "Success",
      description: "Question added successfully",
    });
  };

  const handleUpdateQuestion = (questionData: any) => {
    setLocalQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionData.id ? questionData : q
      ),
    }));
    toast({
      title: "Success",
      description: "Question updated successfully",
    });
  };

  const handleDeleteQuestion = (questionId: number) => {
    setLocalQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
    toast({
      title: "Success",
      description: "Question deleted successfully",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Dispatch action to create new quiz with localQuiz
    console.log("Saving new quiz:", localQuiz);
    // Replace with actual API call or dispatch
    setIsLoading(false);
    toast({
      title: "Success",
      description: "Quiz created successfully",
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-foreground">
        Create New Quiz
      </h2>
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="details">Quiz Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card className="mb-6 shadow-md border-border">
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">
                    Quiz Title *
                  </Label>
                  <Input
                    id="title"
                    value={localQuiz.title}
                    onChange={(e) =>
                      setLocalQuiz({ ...localQuiz, title: e.target.value })
                    }
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
                    value={localQuiz.description}
                    onChange={(e) =>
                      setLocalQuiz({
                        ...localQuiz,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-foreground">
                      Start Time *
                    </Label>
                    <DatePicker
                      value={localQuiz.startTime}
                      onChange={(date) =>
                        setLocalQuiz({ ...localQuiz, startTime: date })
                      }
                      placeholder="Pick start date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-foreground">
                      End Time *
                    </Label>
                    <DatePicker
                      value={localQuiz.endTime}
                      onChange={(date) =>
                        setLocalQuiz({ ...localQuiz, endTime: date })
                      }
                      placeholder="Pick end date"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-foreground">
                    Duration (minutes) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={localQuiz.duration || ""}
                    onChange={(e) =>
                      setLocalQuiz({
                        ...localQuiz,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    className="bg-background text-foreground border-border"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="shuffleQuestions"
                    checked={localQuiz.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      setLocalQuiz({ ...localQuiz, shuffleQuestions: checked })
                    }
                  />
                  <Label htmlFor="shuffleQuestions" className="text-foreground">
                    Shuffle Questions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showResults"
                    checked={localQuiz.showResults}
                    onCheckedChange={(checked) =>
                      setLocalQuiz({ ...localQuiz, showResults: checked })
                    }
                  />
                  <Label htmlFor="showResults" className="text-foreground">
                    Show Results Immediately
                  </Label>
                </div>
                <Button type="submit" disabled={isLoading}>
                  Create Quiz
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="questions">
          <Card className="mb-6 shadow-md border-border">
            <CardContent className="p-6">
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
              >
                <AnimatePresence>
                  {localQuiz.questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      layoutId={`question-${question.id}`}
                      onClick={() => setSelectedQuestion(index)}
                      className="bg-muted/50 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <p className="font-semibold text-foreground">
                        {question.title}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedQuestion(localQuiz.questions.length ?? 0)
                }
                className="mt-4 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AnimatePresence>
        {selectedQuestion !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <Card className="mb-6 shadow-md border-border">
              <CardContent className="p-6">
                <QuestionForm
                  questionData={localQuiz.questions[selectedQuestion]}
                  onSave={(questionData) =>
                    questionData.id
                      ? handleUpdateQuestion(questionData)
                      : handleAddQuestion(questionData)
                  }
                  onDelete={
                    localQuiz.questions[selectedQuestion]?.id
                      ? () =>
                          handleDeleteQuestion(
                            localQuiz.questions[selectedQuestion].id!
                          )
                      : undefined
                  }
                  onCancel={() => setSelectedQuestion(null)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
