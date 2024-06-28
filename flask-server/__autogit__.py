import datetime
from git import Repo

repo_dir = r'C:\Users\admin\fullstack-project\fullstack-project'
commit_message = f"chore: automatic JSON data sync {datetime.datetime.now().strftime('%d-%m-%Y')}"

def git_push():
    try:
        repo = Repo(repo_dir)
        #checking for differences
        if not repo.is_dirty(untracked_files=True) and not repo.index.diff(None):
            print("No changes to commit.")
            return
        
        repo.git.add(update=True)
        repo.index.commit(commit_message)
        origin = repo.remote(name='origin')
        origin.push()
        print("Changes pushed successfully.")

    except Exception as e:
        with open('__LOG__.txt', 'a', encoding='utf-8') as file:
            file.write(f"{datetime.datetime.now()} - error: {e}\n")
        print(f"Error: {e}")

git_push()