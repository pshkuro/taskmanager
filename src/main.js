import SiteMenuCopmonent from "./components/site-menu";
import FilterCopmonent from "./components/filter";
import BoardCopmonent from "./components/boards";
import SortCopmonent from "./components/sorting";
import TaskEditCopmonent from "./components/task-edit";
import TaskCopmonent from "./components/task";
import LoadMoreButtonCopmonent from "./components/load-more-button";
import TasksCopmonent from "./components/tasks";
import NoTasks from "./components/no-tasks";
import {generateFilters} from "./mock/filter";
import {generateTasks} from "./mock/task";
import {renderPosition, render} from "./util";

let activeCard = null;
let activeCardEditForm = null;

const TASK_COUNT = 22;
const SHOWING_TASKS_COUNT_ON_START = 8;
const SHOWING_TASKS_COUNT_BY_BUTTON = 8;


// Логика отрисовка 1 карточки
const renderTask = (taskElement, task) => {

  const taskComponent = new TaskCopmonent(task);
  const taskEditComponent = new TaskEditCopmonent(task);
  const editButton = taskComponent.getElement().querySelector(`.card__btn--edit`);
  const editForm = taskEditComponent.getElement().querySelector(`form`);

  const card = taskComponent.getElement();
  const cardEditForm = taskEditComponent.getElement();

  const replaceTaskToEdit = () => { // Заменяем карточку на форму редактирование
    document.addEventListener(`keydown`, onEscKeyDown);

    if (activeCardEditForm) {
      replaceEditToTask();
    }

    taskElement.replaceChild(cardEditForm, card);
    activeCard = card;
    activeCardEditForm = cardEditForm;

  };

  const replaceEditToTask = () => { // Заменяем форму редактирования на карточку
    document.removeEventListener(`keydown`, onEscKeyDown);

    if (activeCard && activeCardEditForm) {
      taskElement.replaceChild(activeCard, activeCardEditForm);
      activeCard = null;
      activeCardEditForm = null;
    }
  };

  const onEscKeyDown = (evt) => {
    const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

    if (isEscKey) {
      replaceEditToTask();
    }
  };

  editButton.addEventListener(`click`, () => {
    replaceTaskToEdit();
  });

  editForm.addEventListener(`submit`, (evt) => {
    evt.preventDefault();
    replaceEditToTask();
  });

  render(taskElement, taskComponent.getElement(), renderPosition.BEFOREEND); // Отрисовываем карточку

};


// Логика отрисовки всего, что внутри Boad Container
const renderBoard = (boardComponent, tasksData) => {
  const isAllTasksArchived = tasksData.every((task) => task.isArchive); // Проверяем, все ли задачи в архиве

  if (isAllTasksArchived) {
    render(boardComponent.getElement(), new NoTasks().getElement(), renderPosition.BEFOREEND);
    return;
  }

  render(boardComponent.getElement(), new SortCopmonent().getElement(), renderPosition.BEFOREEND);
  render(boardComponent.getElement(), new TasksCopmonent().getElement(), renderPosition.BEFOREEND);


  // Отрисовываем наши карточки
  const taskListElement = boardComponent.getElement().querySelector(`.board__tasks`);
  let showingTasksCount = SHOWING_TASKS_COUNT_ON_START;
  tasksData.slice(0, showingTasksCount)
    .forEach((task) => {
      renderTask(taskListElement, task);
    });

  // Логика кнопки LoadMoreButton
  const loadMoreButtonCopmonent = new LoadMoreButtonCopmonent();
  render(boardComponent.getElement(), loadMoreButtonCopmonent.getElement(), renderPosition.BEFOREEND); // Отрисовка кнопки

  loadMoreButtonCopmonent.getElement().addEventListener(`click`, function () { // По щелчку подгружаем еще карточки
    const prevTasksCount = showingTasksCount;
    showingTasksCount = showingTasksCount + SHOWING_TASKS_COUNT_BY_BUTTON;

    tasksData.slice(prevTasksCount, showingTasksCount)
    .forEach((task) => renderTask(taskListElement, task));

    if (showingTasksCount >= tasks.length) {
      loadMoreButtonCopmonent.getElement().remove();
      loadMoreButtonCopmonent.removeElement();
    }
  });
};

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

const tasks = generateTasks(TASK_COUNT);
const filters = generateFilters(tasks);

// Отрисовка Шапки меню и Фильтров
render(siteHeaderElement, new SiteMenuCopmonent().getElement(), renderPosition.BEFOREEND);
render(siteMainElement, new FilterCopmonent(filters).getElement(), renderPosition.BEFOREEND);

const boardComponent = new BoardCopmonent();
render(siteMainElement, boardComponent.getElement(), renderPosition.BEFOREEND);
renderBoard(boardComponent, tasks);

