"use client";

import { useState } from "react";
import { createWorker } from "tesseract.js";
import { Grade } from "@/app/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const gradeTable = [
  { number: 97, letter: "A+", gpa: 4.0 },
  { number: 94, letter: "A", gpa: 4.0 },
  { number: 90, letter: "A-", gpa: 3.7 },
  { number: 87, letter: "B+", gpa: 3.3 },
  { number: 84, letter: "B", gpa: 3.0 },
  { number: 80, letter: "B-", gpa: 2.7 },
  { number: 77, letter: "C+", gpa: 2.3 },
  { number: 74, letter: "C", gpa: 2.0 },
  { number: 70, letter: "C-", gpa: 1.7 },
  { number: 67, letter: "D+", gpa: 1.3 },
  { number: 64, letter: "D", gpa: 1.0 },
  { number: 60, letter: "D-", gpa: 0.7 },
  { number: 0, letter: "F", gpa: 0.0 },
];
const numberToLetter = (number: number) => {
  for (const item of gradeTable) {
    if (number >= item.number) {
      return item.letter;
    }
  }
};

const numberToGPA = (number: number) => {
  for (const item of gradeTable) {
    if (number >= item.number) {
      return item.gpa;
    }
  }
};

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [totalGPA, setTotalGPA] = useState<number>(0);

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        (async () => {
          const worker = await createWorker("eng");
          const ret = await worker.recognize(reader.result as string);
          console.log(ret.data.text);
          const tempGrades: Grade[] = [];
          let tempTotal = 0;
          for (const line of ret.data.text.split("\n")) {
            const items = line.split(" ");
            if (line.includes("SP25")) {
              tempTotal +=
                numberToGPA(Number(items[items.length - 1].split("%")[0])) || 0;
              tempGrades.push({
                subject: items[1].split("-")[0],
                code: items[1].split("-")[1],
                semester: line[0] + line[1],
                year: Number("20" + line[2] + line[3]),
                grade: Number(items[items.length - 1].split("%")[0]),
                letter:
                  numberToLetter(
                    Number(items[items.length - 1].split("%")[0]),
                  ) || "",
                gpa:
                  numberToGPA(Number(items[items.length - 1].split("%")[0])) ||
                  0,
              });
              console.log(tempGrades);
            }
          }
          setGrades(tempGrades);
          setTotalGPA(tempTotal);
          setLoading(false);
          await worker.terminate();
        })();
      };
    }
  }

  return (
    <div className="container m-8">
      <div>
        <h1>SJSU GPA Calculator</h1>
        <h2>A simple and intuitive GPA calculator for SJSU students</h2>
        <p>Calculate your grades by going into your Canvas page, and on the Card view of your dashboard, you will find a button to view grades. Take a screenshot and upload it here!</p>
      </div>
      {!loading && grades.length === 0 && (
        <div>
          <Input type="file" accept="image/*" onChange={handleUpload} />
        </div>
      )}
      {loading && <p>Loading</p>}
      {!loading && grades.length !== 0 && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Number Grade</TableHead>
                <TableHead>Letter Grade</TableHead>
                <TableHead>GPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade, index) => (
                <TableRow key={index}>
                  <TableCell>{`${grade.subject} ${grade.code}`}</TableCell>
                  <TableCell>{`${grade.semester} ${grade.year}`}</TableCell>
                  <TableCell>{grade.grade}</TableCell>
                  <TableCell>{grade.letter}</TableCell>
                  <TableCell>{grade.gpa}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Card>
            <CardHeader>
              <CardTitle>Academic Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {`Overall GPA: ${(totalGPA || 0) / grades.length}`}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
