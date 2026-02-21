# HSR Fan Catalog (Flask MVP)

## Запуск через VS Code

1. Откройте папку проекта в VS Code.
2. Откройте встроенный терминал (`Terminal -> New Terminal`).
3. Создайте и активируйте виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Для Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

4. Установите зависимости:

```bash
pip install -r requirements.txt
```

5. Запустите приложение:

```bash
python app.py
```

6. Откройте в браузере: http://127.0.0.1:5000

---

## Быстрый запуск из Run and Debug

В проект добавлен `.vscode/launch.json`.

- Откройте вкладку **Run and Debug**.
- Выберите конфигурацию **Flask: app.py**.
- Нажмите **Start Debugging (F5)**.

---

## Примечание про изображения

Картинки персонажей берутся с внешних URL. Если хост ограничивает hotlink, приложение использует backend-прокси `/images/<id>`.
