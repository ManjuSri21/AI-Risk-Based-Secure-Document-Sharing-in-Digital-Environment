import csv
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from train_risk_model import FEATURE_NAMES


SCRIPT = Path(__file__).with_name("train_risk_model.py")


def write_dataset(path, samples_per_class):
    with path.open("w", newline="", encoding="utf-8") as data_file:
        writer = csv.writer(data_file)
        writer.writerow(FEATURE_NAMES + ["riskLevel"])
        for label, feature_index in (("LOW", None), ("MEDIUM", 1), ("HIGH", 0)):
            for sample in range(samples_per_class):
                features = [0] * len(FEATURE_NAMES)
                if feature_index is not None:
                    features[feature_index] = 1
                features[11] = sample % 2
                writer.writerow(features + [label])


class TrainRiskModelTests(unittest.TestCase):
    def test_trains_and_exports_a_validated_tree(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = Path(directory) / "reviewed.csv"
            output = Path(directory) / "risk_model.json"
            write_dataset(dataset, 30)

            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(dataset), "--output", str(output)],
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(output.is_file())
            self.assertIn('"modelVersion": 1', output.read_text(encoding="utf-8"))

    def test_refuses_insufficiently_reviewed_data(self):
        with tempfile.TemporaryDirectory() as directory:
            dataset = Path(directory) / "reviewed.csv"
            output = Path(directory) / "risk_model.json"
            write_dataset(dataset, 5)

            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(dataset), "--output", str(output)],
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("at least 30 reviewed examples per class", result.stderr)
            self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
