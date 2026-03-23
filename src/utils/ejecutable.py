import json
import sys
from py3dbp import Packer, Bin, Item


# Coincide con py3dbp.constants.RotationType (evita depender del __init__ público)
_ROTATION_LABELS = {
    0: "RT_WHD",
    1: "RT_HWD",
    2: "RT_HDW",
    3: "RT_DHW",
    4: "RT_DWH",
    5: "RT_WDH",
}


def _to_float(value):
  """Convierte Decimal u otros numéricos a float para JSON."""
  return float(value)


def item_to_payload(item):
  """Serializa un Item de py3dbp a un dict JSON-friendly."""
  pos = item.position
  dim = item.get_dimension()
  payload = {
      "name": item.name,
      "position": {
          "x": _to_float(pos[0]),
          "y": _to_float(pos[1]),
          "z": _to_float(pos[2]),
      },
      "rotationType": item.rotation_type,
      "rotationLabel": _ROTATION_LABELS.get(item.rotation_type, "UNKNOWN"),
      "dimensions": {
          "width": _to_float(dim[0]),
          "height": _to_float(dim[1]),
          "depth": _to_float(dim[2]),
      },
      "weight": _to_float(item.weight),
      "volume": _to_float(item.get_volume()),
  }
  return payload


def parse_and_pack_json(json_data_string):
  """Parses a JSON string representing baulera and items, creates a Packer object,
  adds bin and items based on the data, and prints the results.

  Args:
      json_data (str): The JSON string containing baulera and items data.

  Raises:
      ValueError: If the JSON data is invalid or missing required fields.
  """

  try:
    data = json.loads(json_data_string)
  except json.JSONDecodeError as e:
    raise ValueError(f"Invalid JSON data: {e}")

  # Validate baulera data
  if "baulera" not in data or not isinstance(data["baulera"], dict):
    raise ValueError("Missing or invalid 'baulera' data in JSON.")
  baulera_data = data["baulera"]
  required_baulera_fields = ["width", "height", "depth", "weightLimit"]
  missing_fields = [field for field in required_baulera_fields if field not in baulera_data]
  if missing_fields:
    raise ValueError(f"Missing required fields in 'baulera': {', '.join(missing_fields)}")

  # Validate items data (optional)
  items_data = data.get("items", [])
  if items_data and not all(isinstance(item, dict) for item in items_data):
    raise ValueError("Invalid format for 'items': expected a list of dictionaries.")

  # Create Packer object
  packer = Packer()

  # Add baulera
  baulera_name = baulera_data.get("name", "baulera")  # Optional name for baulera
  packer.add_bin(
      Bin(
          baulera_name,
          baulera_data["width"],
          baulera_data["height"],
          baulera_data["depth"],
          baulera_data["weightLimit"],
      )
  )

  # Add items
  for item_data in items_data:
    item_name = item_data.get("name", "item")  # Optional name for item
    packer.add_item(Item(item_name, item_data["width"], item_data["height"], item_data["depth"], item_data["weight"]))

  # Pack and print results
  packer.pack(True, False, 2)

  output = {
      "baulera": {
          "detail": packer.bins[0].string()
      },
      "fittedItems": [
      ],
      "unfittedItems": [
      ]
  }

  for item in packer.bins[0].items:
    row = item_to_payload(item)
    row["detail"] = item.string()
    output["fittedItems"].append(row)

  for item in packer.bins[0].unfitted_items:
    row = item_to_payload(item)
    row["detail"] = item.string()
    output["unfittedItems"].append(row)

  return json.dumps(output)


if __name__ == "__main__":
  if len(sys.argv) < 3:
    raise ValueError("Missing JSON data as argument.")

  data_baulera = sys.argv[1].split("::")[1]

  json_data_string = {
      "baulera": {
          "name": data_baulera.split("|")[0],
          "width": data_baulera.split("|")[1],
          "height": data_baulera.split("|")[2],
          "depth": data_baulera.split("|")[3],
          "weightLimit": data_baulera.split("|")[4]
      },
      "items": []
  }
  for item in sys.argv[2:]:
    if not item.startswith("item::"):
      continue
    data_item = item.split("::", 1)[1]
    aux = {
        "name": data_item.split("|")[0],
        "width": data_item.split("|")[1],
        "height": data_item.split("|")[2],
        "depth": data_item.split("|")[3],
        "weight": data_item.split("|")[4]
    }
    for x in range(int(data_item.split("|")[5])):
      json_data_string["items"].append(aux)
  data = json.dumps(json_data_string)
  result = parse_and_pack_json(data)
  print(result)
