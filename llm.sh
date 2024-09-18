#!/usr/bin/env zsh

# Base directories and specific files to include
INCLUDE_DIRS=("docs")
INCLUDE_FILES=("README.md" ".env.example")

# Output markdown file
OUTPUT_FILE="llm.md"

# Create or clear the output file
echo "# Files" >"$OUTPUT_FILE"

# Function to process each file
process_file() {
    local file_path="$1"
    local file_extension="${file_path##*.}"
    echo "\n## ${file_path}\n" >>"$OUTPUT_FILE"
    echo "\`\`\`${file_extension}" >>"$OUTPUT_FILE"
    # Add the content of the file and ensure there is a trailing newline
    awk '{print} END {if (NR > 0 && substr($0, length($0), 1) != "\n") print ""}' "$file_path" >>"$OUTPUT_FILE"
    echo "\`\`\`\n" >>"$OUTPUT_FILE"
}

# Function to check if a file is ignored
is_ignored() {
    git check-ignore -q "$1"
}

# Function to check if a file is binary
is_binary() {
    local file_path="$1"
    # Use dd and file command to determine if the file is binary
    if dd if="$file_path" bs=512 count=1 2>/dev/null | grep -q '[^[:print:]\t\n]'; then
        return 0
    else
        return 1
    fi
}

# Process each directory
for dir in "${INCLUDE_DIRS[@]}"; do
    find "$dir" -type f ! -path "*/__pycache__/*" | while read -r file; do
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
    echo "\n# Requirements:"
    echo ""
    echo "## Language"
    echo ""
    echo "Always write in Australian English"
    echo ""
    echo "## Technical and Coding Proficiency:"
    echo "When providing code examples and revisions, adhere strictly to the relevant Google Style Guide ie For Python, follow the Google Python Style Guide, Bash follow the Google Bash Style Guide etc. Furthermore:"
    echo "1. **All code must be Google Style Guide compliant where one exists, best practice if not**."
    echo "2. **All code must be fully typed in languages that support typing**. Including variables."
    echo "3. **When typing, the \`Any\` type must be avoided**. If it is required, detailed comments at its use must be made explaining why."
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
    echo "12. Ensure all imports/includes are referenced in the code, do not import/include if not."
    echo ""
    echo "# Context"
    echo ""
    echo "## Date"
    echo ""
    echo "Today is $(date '+%A, %d %B %Y')"
    echo ""
} >>"$OUTPUT_FILE"

echo "LLM prompt file has been generated at ${OUTPUT_FILE}"
