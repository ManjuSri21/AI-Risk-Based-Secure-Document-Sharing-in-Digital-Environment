import argparse
import csv
import json
import sys
from collections import Counter
from pathlib import Path

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.tree import DecisionTreeClassifier

FEATURE_NAMES = [
    "aadhaar",
    "pan",
    "financial",
    "email",
    "phone",
    "dateOfBirth",
    "address",
    "student",
    "medical",
    "compensation",
    "extractionFailed",
    "filePdf",
    "fileImage",
    "fileText",
    "fileWord",
]
CLASSES = ["LOW", "MEDIUM", "HIGH"]
MINIMUM_SAMPLES_PER_CLASS = 20


def read_dataset(csv_path):
    with csv_path.open(newline="", encoding="utf-8-sig") as data_file:
        reader = csv.DictReader(data_file)
        expected_headers = FEATURE_NAMES + ["riskLevel"]
        if reader.fieldnames != expected_headers:
            raise ValueError(
                f"CSV header mismatch. Expected: {expected_headers}, got: {reader.fieldnames}"
            )

        rows = []
        labels = []
        for row_number, row in enumerate(reader, start=2):
            label = row["riskLevel"].strip().upper()
            if label not in set(CLASSES):
                raise ValueError(f"Row {row_number}: riskLevel must be LOW, MEDIUM, or HIGH.")
            try:
                features = [int(row[name]) for name in FEATURE_NAMES]
            except (TypeError, ValueError) as error:
                raise ValueError(f"Row {row_number}: features must be 0 or 1.") from error
            if any(value not in (0, 1) for value in features):
                raise ValueError(f"Row {row_number}: features must be 0 or 1.")
            rows.append(features)
            labels.append(label)

    counts = Counter(labels)
    insufficient = {
        label: counts.get(label, 0)
        for label in sorted(CLASSES)
        if counts.get(label, 0) < MINIMUM_SAMPLES_PER_CLASS
    }
    if insufficient:
        details = ", ".join(f"{label}={count}" for label, count in insufficient.items())
        raise ValueError(
            f"Need at least {MINIMUM_SAMPLES_PER_CLASS} reviewed examples per class before "
            f"training; current counts: {details}."
        )
    return rows, labels, counts


def export_tree(classifier, metrics=None):
    tree = classifier.tree_
    nodes = []
    for index in range(tree.node_count):
        feature = tree.feature[index]
        is_leaf = tree.children_left[index] == tree.children_right[index]
        nodes.append(
            {
                "feature": None if is_leaf else int(feature),
                "threshold": None if is_leaf else float(tree.threshold[index]),
                "left": None if is_leaf else int(tree.children_left[index]),
                "right": None if is_leaf else int(tree.children_right[index]),
                "values": [float(value) for value in tree.value[index][0]],
            }
        )
    return {
        "modelVersion": 1,
        "featureNames": FEATURE_NAMES,
        "classes": [str(label) for label in classifier.classes_],
        "root": 0,
        "nodes": nodes,
        "metrics": metrics or {},
    }


def main():
    parser = argparse.ArgumentParser(
        description="Train, evaluate, and export the SecureShare supervised Decision Tree model."
    )
    parser.add_argument("dataset", type=Path, help="CSV path of labeled risk dataset")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).with_name("risk_model.json"),
        help="Output path for the trained model (defaults to backend/ml/risk_model.json)",
    )
    args = parser.parse_args()

    try:
        features, labels, counts = read_dataset(args.dataset)
        x_train, x_test, y_train, y_test = train_test_split(
            features,
            labels,
            test_size=0.2,
            random_state=42,
            stratify=labels,
        )

        classifier = DecisionTreeClassifier(
            max_depth=10,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
        )
        classifier.fit(x_train, y_train)

        # 5-Fold Stratified Cross Validation
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(classifier, features, labels, cv=cv, scoring="accuracy")

        predictions = classifier.predict(x_test)
        report = classification_report(
            y_test,
            predictions,
            labels=CLASSES,
            output_dict=True,
            zero_division=0,
        )
        cm = confusion_matrix(y_test, predictions, labels=CLASSES).tolist()
        macro_f1 = f1_score(y_test, predictions, average="macro", zero_division=0)
        high_recall = recall_score(y_test, predictions, labels=["HIGH"], average=None, zero_division=0)[0]
        accuracy = accuracy_score(y_test, predictions)

        metrics = {
            "samplesTotal": len(labels),
            "samplesTrain": len(y_train),
            "samplesTest": len(y_test),
            "classCounts": dict(sorted(counts.items())),
            "accuracy": round(float(accuracy), 4),
            "crossValAccuracyMean": round(float(cv_scores.mean()), 4),
            "crossValAccuracyStd": round(float(cv_scores.std()), 4),
            "macroF1": round(float(macro_f1), 4),
            "highRiskRecall": round(float(high_recall), 4),
            "confusionMatrix": {
                "labels": CLASSES,
                "matrix": cm,
            },
            "classificationReport": report,
        }
        print("=== Decision Tree Model Training & Evaluation Results ===")
        print(json.dumps(metrics, indent=2))

        if macro_f1 < 0.70 or high_recall < 0.85:
            raise ValueError(
                f"Validation thresholds not met (macro F1 >= 0.70, HIGH recall >= 0.85). Got F1: {macro_f1}, High Recall: {high_recall}"
            )

        args.output.parent.mkdir(parents=True, exist_ok=True)
        model_payload = export_tree(classifier, metrics)
        args.output.write_text(json.dumps(model_payload, indent=2) + "\n", encoding="utf-8")
        print(f"\n[SUCCESS] Validated Decision Tree model artifact saved to {args.output}")

    except (OSError, ValueError) as error:
        print(f"Training stopped: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


