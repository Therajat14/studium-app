#include <stdio.h>
#include <stdlib.h>

#define MAX 5  

int stack[MAX];
int top = -1;

// Push operation
void push() {
    int value;
    if (top == MAX - 1) {
        printf("\nStack Overflow! Cannot push more elements.\n");
    } else {
        printf("\nEnter value to push: ");
        scanf("%d", &value);
        top++;
        stack[top] = value;
        printf("\n%d pushed onto stack.\n", value);
    }
}


void pop() {
    if (top == -1) {
        printf("\nStack Underflow! No elements to pop.\n");
    } else {
        printf("\nPopped element: %d\n", stack[top]);
        top--;
    }
}


void display() {
    if (top == -1) {
        printf("\nStack is empty.\n");
    } else {
        printf("\nStack elements (top to bottom):\n");
        for (int i = top; i >= 0; i--) {
            printf("%d\n", stack[i]);
        }
    }
}


int main() {
    int choice;

    while (1) {
        printf("\n.............................");
        printf("\n       STACK MENU");
        printf("\n.............................");
        printf("\n1. Push");
        printf("\n2. Pop");
        printf("\n3. Display");
        printf("\n4. Exit");
        printf("\n............................");
        printf("\nEnter your choice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1: push(); break;
            case 2: pop(); break;
            case 3: display(); break;
            case 4: 
                printf("\nExiting program... Goodbye!\n");
                exit(0);
            default: 
                printf("\nInvalid choice! Please try again.\n");
        }
    }

    return 0;
}
