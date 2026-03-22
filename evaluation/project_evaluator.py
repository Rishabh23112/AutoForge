import os
from evaluation.evaluator import evaluate_file
from rich import print


def read_file(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def normalize_files(files):
    normalized = []

    for f in files:
        if isinstance(f, dict):
            path = str(f.get("path") or f.get("file_location") or "")
            content = str(f.get("content") or f.get("file_content") or "")
        else:
            path = str(getattr(f, "path", f))
            content = str(getattr(f, "content", ""))

        normalized.append({
            "path": path,
            "content": content
        })

    return normalized


def evaluate_project(files):
    results = []


    files = normalize_files(files)

    for f in files:
        try:
            path = f["path"]
            code = f["content"]

            if not code:
                code = read_file(path)

            result = evaluate_file(path, code)
            results.append(result)

        except Exception as e:
            print(f"[red] Error evaluating {path}: {e}[/red]")

    return results


def aggregate_scores(results):
    if not results:
        return 0

    avg_score = sum(r.score for r in results) / len(results)
    return round(avg_score, 2)


def print_results(results):
    for r in results:
        print(f"\n📄 {r.file_path}")
        print(f"Score: {r.score}/10")
        print("Issues:", r.issues)
        print("Feedback:", r.feedback)