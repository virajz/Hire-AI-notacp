import nltk
import os
import ssl

# --- NLTK SSL Hotfix (if needed, often for local environments or specific Python versions) ---
# Some environments might have SSL certificate verification issues when NLTK tries to download.
# This attempts to use the default system SSL certificates if available.
# If you don't face SSL errors during download, you might not strictly need this part.
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass # Python version doesn't have/need it
else:
    ssl._create_default_https_context = _create_unverified_https_context
# --- End NLTK SSL Hotfix ---

# Define a path within your project where NLTK data will be stored.
# This path will be relative to your project root.
# On Render, this will typically become /opt/render/project/src/nltk_data_local
project_root = os.getcwd() # Assumes script is run from project root
nltk_data_storage_path = os.path.join(project_root, "nltk_data_local")

def download_resources():
    print(f"Attempting to download NLTK resources to: {nltk_data_storage_path}")
    if not os.path.exists(nltk_data_storage_path):
        os.makedirs(nltk_data_storage_path, exist_ok=True)
        print(f"Created directory: {nltk_data_storage_path}")

    resources = [
        "stopwords",
        "punkt",  # Often needed for tokenization
        "averaged_perceptron_tagger", # For POS tagging
        "wordnet", # For lemmatization, synonyms etc.
        "maxent_ne_chunker", # For Named Entity Recognition
        "words" # For Named Entity Recognition
    ]
    for resource in resources:
        try:
            # Check if already downloaded to the target directory to avoid re-downloading
            # NLTK's find logic can be complex with custom download_dir, so a simple check:
            resource_found = False
            if resource == "stopwords": # stopwords are in 'corpora'
                 if os.path.exists(os.path.join(nltk_data_storage_path, "corpora", "stopwords")):
                     resource_found = True
            elif resource in ["punkt", "wordnet", "words", "maxent_ne_chunker"]: # these are often in 'tokenizers', 'corpora', or 'chunkers'
                 if os.path.exists(os.path.join(nltk_data_storage_path, "tokenizers", resource)) or \
                    os.path.exists(os.path.join(nltk_data_storage_path, "corpora", resource)) or \
                    os.path.exists(os.path.join(nltk_data_storage_path, "chunkers", resource)):
                     resource_found = True
            elif resource == "averaged_perceptron_tagger": # in 'taggers'
                 if os.path.exists(os.path.join(nltk_data_storage_path, "taggers", resource)):
                     resource_found = True
            
            if resource_found:
                print(f"NLTK resource '{resource}' already found in {nltk_data_storage_path}. Skipping download.")
                continue

            print(f"Downloading NLTK resource: {resource}...")
            nltk.download(resource, download_dir=nltk_data_storage_path)
            print(f"Successfully downloaded {resource}.")
        except Exception as e:
            print(f"Error downloading NLTK resource '{resource}': {e}")
            # Depending on how critical each resource is, you might want to
            # re-raise the exception here to fail the build if a download fails.
            # For now, it just prints the error and continues.

if __name__ == "__main__":
    download_resources()
    print(f"NLTK resource download process complete. Data should be in: {nltk_data_storage_path}")
    # Verify by listing contents (optional, for build logs)
    if os.path.exists(nltk_data_storage_path):
        print(f"Contents of {nltk_data_storage_path}:")
        for root, dirs, files in os.walk(nltk_data_storage_path):
            for name in files:
                print(os.path.join(root, name))
            for name in dirs:
                print(os.path.join(root, name))
    
    # This line is important for the build script to know NLTK can find the data *during the build*
    # if any subsequent build steps use NLTK.
    if nltk_data_storage_path not in nltk.data.path:
        nltk.data.path.append(nltk_data_storage_path)
    print(f"NLTK search paths (during build script execution): {nltk.data.path}")
