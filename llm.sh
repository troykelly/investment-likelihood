#!/usr/bin/env bash

# LLM Prompt Generator Script
# Author: Your Name
# Contact Information: Your Contact Info
# Description:
#   Generates an LLM prompt by aggregating specified files and directories.
#   Includes functionality to reduce the size of large JSON and YAML files by truncating arrays.
#
# Code History:
#   - [Date]: Initial script creation.
#   - [Date]: Added size reduction for JSON and YAML files larger than JSON_MAX_SIZE.
#   - [Date]: Fixed issues with echoing file content causing errors.

# Default values for JSON processing
JSON_MAX_SIZE=${JSON_MAX_SIZE:-20480}  # Defaults to 20 KiB
JSON_MAX_DEPTH=${JSON_MAX_DEPTH:-10}   # Defaults to depth of 10
JSON_DONT_MODIFY=(${JSON_DONT_MODIFY[@]})  # Files not to modify (defaults to empty list)

# Directories and files to include
INCLUDE_DIRS=("docs")
INCLUDE_FILES=("README.md" ".env.example")

# Extensions to ignore
IGNORE_EXTENSIONS=("svg" "jpg" "png" "gif" "pdf" "zip" "tar" "gz")

# Output markdown file
OUTPUT_FILE="llm.md"

# Create or clear the output file
echo "# Files" > "$OUTPUT_FILE"

# Function to process each file
process_file() {
  local file_path="$1"
  local file_extension="${file_path##*.}"
  local file_name
  file_name="$(basename "$file_path")"
  local file_size
  local dont_modify=false

  # Check if the file is in JSON_DONT_MODIFY
  for dont_modify_file in "${JSON_DONT_MODIFY[@]}"; do
    if [[ "$file_name" == "$dont_modify_file" ]]; then
      dont_modify=true
      break
    fi
  done

  # Append headings to the output file
  {
    echo ""
    echo "## ${file_path}"
    echo ""
    echo "\`\`\`${file_extension}"
  } >> "$OUTPUT_FILE"

  # Process JSON and YAML files for size reduction
  if [[ "$file_extension" == "json" || "$file_extension" == "yaml" || "$file_extension" == "yml" ]]; then
    file_size=$(stat -c%s "$file_path")
    if (( file_size > JSON_MAX_SIZE )) && [[ "$dont_modify" == false ]]; then
      # Reduce the size of the file content
      if [[ "$file_extension" == "json" ]]; then
        reduce_json_file "$file_path" >> "$OUTPUT_FILE"
      else
        reduce_yaml_file "$file_path" >> "$OUTPUT_FILE"
      fi
    else
      cat "$file_path" >> "$OUTPUT_FILE"
    fi
  else
    cat "$file_path" >> "$OUTPUT_FILE"
  fi

  # Close the code block
  {
    echo "\`\`\`"
    echo ""
  } >> "$OUTPUT_FILE"
}

# Function to reduce JSON file size by truncating arrays
reduce_json_file() {
  local file_path="$1"
  local depth="$JSON_MAX_DEPTH"
  jq --argjson depth "$depth" '
    def truncate($d):
      if $d == 0 then
        .
      elif type == "array" then
        if length > 2 then
          [.[0], .[1], "... truncated ..."]
        else
          map(. | truncate($d - 1))
        end
      elif type == "object" then
        with_entries(.value |= truncate($d - 1))
      else
        .
      end;
    truncate($depth)
  ' "$file_path"
}

# Function to reduce YAML file size by truncating arrays
reduce_yaml_file() {
  local file_path="$1"
  local depth="$JSON_MAX_DEPTH"
  yq eval '
    def truncate(d):
      if d == 0 then
        .
      elif type == "!!seq" then
        if length > 2 then
          [.[0], .[1], "... truncated ..."]
        else
          map(. | truncate(d - 1))
            end
          elif type == "!!map" then
            with_entries(.value |= truncate(d - 1))
          else
            .
          end;
        truncate('"$depth"')
      ' "$file_path"
}

# Function to check if a file should be ignored based on extension
is_ignored() {
  local file_path="$1"
  local file_extension="${file_path##*.}"

  # Check against ignored extensions
  for ext in "${IGNORE_EXTENSIONS[@]}"; do
    if [[ "$file_extension" == "$ext" ]]; then
      # Check if the file is explicitly included
      for include_file in "${INCLUDE_FILES[@]}"; do
        if [[ "$file_path" == "$include_file" ]]; then
          return 1 # Not ignored
        fi
      done
      return 0 # Ignored
    fi
  done

  return 1 # Not ignored
}

# Function to check if a file is binary
is_binary() {
  local file_path="$1"
  # Use grep to check for binary data in the file
  if grep -qI "." "$file_path"; then
    return 1 # Not binary
  else
    return 0 # Binary
  fi
}

# Process each directory
for dir in "${INCLUDE_DIRS[@]}"; do
  find "$dir" -type f ! -path "*/__pycache__/*" | while IFS= read -r file; do
    if ! is_ignored "$file" && ! is_binary "$file"; then
      process_file "$file"
    fi
  done
done

# Process each specific file
for file in "${INCLUDE_FILES[@]}"; do
  if [[ -f "$file" ]] && ! is_ignored "$file" && ! is_binary "$file"; then
    process_file "$file"
  fi
done

# Append the additional text to the output file
{
  echo ""
  echo "# Requirements:"
  echo ""
  echo "## Language"
  echo ""
  echo "Always write in Australian English"
  echo ""
  echo "## Technical and Coding Proficiency:"
  echo "When providing code examples and revisions, adhere strictly to the relevant Google Style Guide ie For Python, follow the Google Python Style Guide; for Bash, follow the Google Bash Style Guide, etc. Furthermore:"
  echo "1. **All code must be Google Style Guide compliant where one exists, best practice if not**."
  echo "2. **All code must be fully typed in languages that support typing**, including variables."
  echo "3. **When typing, the \`Any\` type must be avoided**. If it is required, detailed comments explaining why must be provided."
  echo "4. **All code must be broken into the smallest logical functional components**."
  echo "5. **Classes should be used where appropriate for functionality**."
  echo "6. **All reasonable exceptions must be caught and handled**, including cleanup where appropriate."
  echo "7. **All reasonable signals (including TERM, KILL, HUP, etc.) must be caught and handled appropriately**, including cleanup where appropriate."
  echo "8. **All code must be very well documented inline**."
  echo "9. **Examples should be included in comments where appropriate**."
  echo "10. **When creating new files**, an appropriate **file header should be included**:"
  echo "    - The purpose and description of the file."
  echo "    - The author's name and contact information."
  echo "    - Code history and changes."
  echo "11. **When creating a new file that is intended to be executed**, it should use the \`env\` shebang method:"
  echo "    \`\`\`python"
  echo "    #!/usr/bin/env python3"
  echo "    \`\`\`"
  echo "12. Ensure all imports/includes are referenced in the code; do not import/include if not needed."
  echo ""
  echo "# Context"
  echo ""
  echo "## Date"
  echo ""
  echo "Today is $(date '+%A, %d %B %Y')"
  echo ""
} >> "$OUTPUT_FILE"

echo "LLM prompt file has been generated at ${OUTPUT_FILE}"