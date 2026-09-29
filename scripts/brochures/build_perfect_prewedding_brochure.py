import sys
from pathlib import Path

# Run the master generator
scripts_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(scripts_dir))
import generate_perfect_prewedding_brochure
